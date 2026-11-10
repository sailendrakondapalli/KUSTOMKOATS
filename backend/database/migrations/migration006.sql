-- E-Way Bill Proxy using Supabase Database Function with pg_net (Async Approach)
-- This works on Free tier and doesn't require Edge Functions

-- Enable pg_net extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA net TO authenticated;

-- Create a table to store HTTP responses
CREATE TABLE IF NOT EXISTS eway_bill_requests (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT UNIQUE NOT NULL,
  action TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  response JSONB,
  error TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE eway_bill_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own requests
CREATE POLICY "Users can view own requests" ON eway_bill_requests
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own requests" ON eway_bill_requests
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Function to initiate E-Way Bill API call (async)
CREATE OR REPLACE FUNCTION initiate_eway_bill_request(
  action TEXT,
  api_data JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_url TEXT;
  request_id BIGINT;
  auth_token TEXT;
  request_headers JSONB;
  request_body JSONB;
  our_request_id BIGINT;
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Determine API endpoint and prepare request
  CASE action
    WHEN 'authenticate' THEN
      api_url := 'https://api.ewaybillgst.gov.in/authenticate';
      request_headers := jsonb_build_object('Content-Type', 'application/json');
      request_body := jsonb_build_object(
        'username', api_data->>'username',
        'password', api_data->>'password'
      );
      
      -- Make async POST request
      SELECT net.http_post(
        url := api_url,
        headers := request_headers,
        body := request_body
      ) INTO request_id;
      
    WHEN 'generate' THEN
      api_url := 'https://api.ewaybillgst.gov.in/ewayapi/v1.03/ewayapi';
      auth_token := api_data->>'authToken';
      request_headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'authtoken', auth_token
      );
      request_body := api_data->'ewayBillData';
      
      SELECT net.http_post(
        url := api_url,
        headers := request_headers,
        body := request_body
      ) INTO request_id;
      
    WHEN 'get' THEN
      api_url := 'https://api.ewaybillgst.gov.in/ewayapi/v1.03/ewayapi/getewaybill?ewbNo=' || (api_data->>'ewbNo');
      auth_token := api_data->>'authToken';
      request_headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'authtoken', auth_token
      );
      
      SELECT net.http_get(
        url := api_url,
        headers := request_headers
      ) INTO request_id;
      
    WHEN 'cancel' THEN
      api_url := 'https://api.ewaybillgst.gov.in/ewayapi/v1.03/ewayapi/cancewaybill';
      auth_token := api_data->>'authToken';
      request_headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'authtoken', auth_token
      );
      request_body := jsonb_build_object(
        'ewbNo', api_data->>'ewbNo',
        'cancelRsnCode', api_data->>'cancelRsnCode',
        'cancelRmrk', api_data->>'cancelRmrk'
      );
      
      SELECT net.http_post(
        url := api_url,
        headers := request_headers,
        body := request_body
      ) INTO request_id;
      
    ELSE
      RAISE EXCEPTION 'Invalid action: %', action;
  END CASE;

  -- Store request info in our table
  INSERT INTO eway_bill_requests (request_id, action, created_by)
  VALUES (request_id, action, auth.uid())
  RETURNING id INTO our_request_id;

  RETURN our_request_id;
END;
$$;

-- Function to check request status and get response
CREATE OR REPLACE FUNCTION get_eway_bill_response(req_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  pg_net_request_id BIGINT;
  http_status INT;
  http_content TEXT;
  request_age INTERVAL;
BEGIN
  -- Check if user owns this request
  IF NOT EXISTS (
    SELECT 1 FROM eway_bill_requests 
    WHERE id = req_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized or request not found';
  END IF;

  -- Get the pg_net request_id and check request age
  SELECT request_id, NOW() - created_at 
  INTO pg_net_request_id, request_age
  FROM eway_bill_requests
  WHERE id = req_id;

  -- Check if response is available from pg_net
  BEGIN
    SELECT status_code, content::text
    INTO http_status, http_content
    FROM net._http_response
    WHERE id = pg_net_request_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- If we can't access net._http_response, mark as failed after 10 seconds
      IF request_age > INTERVAL '10 seconds' THEN
        UPDATE eway_bill_requests
        SET status = 'failed',
            error = 'pg_net response table not accessible or pg_net not working properly',
            updated_at = NOW()
        WHERE id = req_id;
        
        RETURN jsonb_build_object(
          'status', 'failed',
          'error', 'pg_net is not working properly. Consider using Edge Functions instead.',
          'debug', SQLERRM
        );
      END IF;
      
      RETURN jsonb_build_object(
        'status', 'pending',
        'message', 'Request is still processing'
      );
  END;

  -- If no response yet, return pending status
  IF http_status IS NULL THEN
    -- If request is too old (>20 seconds), mark as failed
    IF request_age > INTERVAL '20 seconds' THEN
      UPDATE eway_bill_requests
      SET status = 'failed',
          error = 'Request timeout - no response received from pg_net',
          updated_at = NOW()
      WHERE id = req_id;
      
      RETURN jsonb_build_object(
        'status', 'failed',
        'error', 'Request timeout after 20 seconds. pg_net may not be enabled or working.'
      );
    END IF;
    
    RETURN jsonb_build_object(
      'status', 'pending',
      'message', 'Request is still processing'
    );
  END IF;

  -- Parse response
  IF http_status BETWEEN 200 AND 299 THEN
    result := http_content::jsonb;
    
    -- Update our table
    UPDATE eway_bill_requests
    SET status = 'completed',
        response = result,
        updated_at = NOW()
    WHERE id = req_id;
    
    RETURN jsonb_build_object(
      'status', 'completed',
      'data', result
    );
  ELSE
    -- Error response
    result := jsonb_build_object(
      'error', http_content,
      'status_code', http_status
    );
    
    UPDATE eway_bill_requests
    SET status = 'failed',
        error = http_content,
        updated_at = NOW()
    WHERE id = req_id;
    
    RETURN jsonb_build_object(
      'status', 'failed',
      'error', http_content,
      'status_code', http_status
    );
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION initiate_eway_bill_request(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_eway_bill_response(BIGINT) TO authenticated;

-- Test function
CREATE OR REPLACE FUNCTION test_eway_bill_connection()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'E-Way Bill proxy functions are ready! Use initiate_eway_bill_request() and get_eway_bill_response()';
$$;

COMMENT ON FUNCTION initiate_eway_bill_request IS 'Initiate async E-Way Bill API request';
COMMENT ON FUNCTION get_eway_bill_response IS 'Get response from E-Way Bill API request';
COMMENT ON TABLE eway_bill_requests IS 'Stores E-Way Bill API requests and responses';
