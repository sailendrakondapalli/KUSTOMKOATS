-- Extends site_pages_content to cover the policy / info pages previously
-- hardcoded in src/pages/PolicyPage.jsx:
--   shipping-policy    -> /shipping-policy
--   refund-policy      -> /refund-policy
--   privacy-policy     -> /privacy-policy
--   military-discount  -> /military-discount
--   kk-rewards          -> /kk-rewards
--   privacy-choices    -> /privacy-choices
--   order-protection   -> /order-protection
--
-- Run this AFTER site-pages-content-schema.sql.
-- It relaxes the page_key check constraint to allow the new keys, then seeds them.

alter table public.site_pages_content
  drop constraint if exists site_pages_content_page_key_check;

alter table public.site_pages_content
  add constraint site_pages_content_page_key_check
  check (page_key in (
    'why-partner', 'our-story', 'our-philosophy',
    'shipping-policy', 'refund-policy', 'privacy-policy',
    'military-discount', 'kk-rewards', 'privacy-choices', 'order-protection'
  ));

-- Seed content that matches what is currently hardcoded in PolicyPage.jsx
insert into public.site_pages_content (page_key, hero_title, hero_subtitle, sections)
values
  ('shipping-policy', 'Shipping Policy', '', '[
    {"heading": "Processing Time", "body": "Orders are typically processed within 1-2 business days. You will receive a confirmation email once your order ships."},
    {"heading": "Shipping Timeframes", "body": "Standard shipping typically takes 3-7 business days depending on your location. Expedited options are available at checkout."},
    {"heading": "Tracking Your Order", "body": "Once your order ships, you will receive a tracking number via email so you can follow its progress."},
    {"heading": "Contact", "body": "For shipping questions, reach out via our Contact page with your order number."}
  ]'::jsonb),

  ('refund-policy', 'Refund Policy', '', '[
    {"heading": "Eligibility", "body": "Unused, unopened products can be returned within 30 days of delivery for a full refund."},
    {"heading": "How to Request a Refund", "body": "Contact us via our Contact page with your order number and reason for the return. Our team will guide you through the process."},
    {"heading": "Processing Time", "body": "Approved refunds are processed within 5-7 business days after we receive the returned item."},
    {"heading": "Non-Refundable Items", "body": "Custom-mixed or opened pearl/wrap products cannot be returned once used."}
  ]'::jsonb),

  ('privacy-policy', 'Privacy Policy', '', '[
    {"heading": "Information We Collect", "body": "We collect your name, email address, phone number, and order details when you shop with us or make an enquiry."},
    {"heading": "How We Use It", "body": "Your information is used solely to process orders, send updates, and improve our services. We do not sell your data to third parties."},
    {"heading": "Data Security", "body": "All data is stored securely. Payment transactions are handled via trusted third-party processors and we do not store card details."},
    {"heading": "Cookies", "body": "We use cookies to improve site performance and remember your preferences. You can disable cookies in your browser settings."},
    {"heading": "Contact", "body": "For any privacy concerns, reach out via our Contact page."}
  ]'::jsonb),

  ('military-discount', 'Military & First Responder Discounts', '', '[
    {"heading": "Who Qualifies", "body": "Active duty military, veterans, reservists, and first responders (police, fire, EMS) are eligible for a special discount on Kustom Koats products."},
    {"heading": "How to Redeem", "body": "Contact our support team with valid ID or service verification to receive your discount code. Once verified, the code can be applied at checkout on eligible orders."},
    {"heading": "Terms", "body": "This discount cannot be combined with other promotional offers or wholesale pricing. Kustom Koats reserves the right to request verification at any time."},
    {"heading": "Contact", "body": "To apply for this discount, reach out via our Contact page and mention \"Military & First Responder Discount\" in your message."}
  ]'::jsonb),

  ('kk-rewards', 'KK Point Rewards', '', '[
    {"heading": "Earning Points", "body": "Earn KK Points on every purchase made on our site. Points accumulate automatically to your account and can be redeemed on future orders."},
    {"heading": "Redeeming Points", "body": "KK Points can be redeemed at checkout for discounts on eligible products. Redemption details and current point value will be shown in your account dashboard."},
    {"heading": "Program Terms", "body": "Points have no cash value and cannot be transferred between accounts. Kustom Koats may update or discontinue the rewards program at any time with notice."},
    {"heading": "Contact", "body": "Questions about your KK Points balance? Reach out through our Contact page and our team will help."}
  ]'::jsonb),

  ('privacy-choices', 'Your Privacy Choices', '', '[
    {"heading": "Your Rights", "body": "You have the right to access, correct, or request deletion of your personal information collected by Kustom Koats."},
    {"heading": "Opting Out", "body": "You may opt out of marketing communications at any time by using the unsubscribe link in our emails or by contacting us directly."},
    {"heading": "Data Sharing", "body": "We do not sell your personal information to third parties. Data is only shared with trusted service providers necessary to fulfill orders (e.g., payment processors, shipping carriers)."},
    {"heading": "Contact", "body": "To exercise any privacy choice or ask about your data, contact us via our Contact page."}
  ]'::jsonb),

  ('order-protection', 'Order Protection', '', '[
    {"heading": "What It Covers", "body": "Order Protection helps cover your order in case of loss, theft, or damage during shipping, so you can get a replacement or refund without hassle."},
    {"heading": "How to Add It", "body": "Order Protection can be added as an optional add-on during checkout for a small fee based on your order total."},
    {"heading": "Filing a Claim", "body": "If your order arrives damaged or does not arrive, contact our support team within 30 days of the estimated delivery date to file a claim."},
    {"heading": "Contact", "body": "To file a claim or ask about Order Protection, reach out via our Contact page with your order number."}
  ]'::jsonb)
on conflict (page_key) do nothing;
