# Site Implementation Document

_For joelflood.com - Art Portfolio + Professional Resume Site_

## 1. Objective

The objective of this project is to design and deploy a modern, minimal, highly secure, cost-efficient, static website hosted entirely on AWS.
The site features:

- A visual-first art portfolio (primary focus)
- A clean, accessible professional resume page
- Use of AWS services to demonstrate cloud proficiency
- GitHub repo links for this project and other GRC/AWS projects
- Optional pages for bicycles, Rebour drawings, and additional artwork

---

## 2. Architecture Overview

### 2.1 High-Level Diagram

**Frontend hosting stack**

- Amazon S3 (private, not publicly accessible)
- CloudFront with Origin Access Control (OAC)
- AWS ACM for TLS certificates
- Route 53 DNS

**Backend components**

- Lambda for visitor counter logic
- API Gateway for HTTPS endpoint
- DynamoDB for atomic counter storage
- CloudWatch logs for monitoring

**Security & Monitoring**

- GuardDuty enabled for the AWS account
- CloudFront security headers & CSP
- Geo-restriction allowlist
- Optional AWS WAF (future)

---

## 3. Implementation Components

### 3.1 S3 Bucket

- Bucket hosts static assets
- Public access blocked
- OAC grants CloudFront exclusive read access
- Website hosting disabled (CloudFront handles routing)

### 3.2 CloudFront

- Uses OAC for secure origin requests
- HTTPS enforced
- Custom error pages and routing rules
- Geo-restriction enabled with small allowlist
- Includes strong security headers (CSP, HSTS, permissions-policy, etc.)

### 3.3 TLS Certificates (ACM)

- Issued for:
  - joelflood.com
  - www.joelflood.com
- Attached to CloudFront

### 3.4 Route 53

- Apex and www records point to CloudFront
- **DNSSEC disabled** due to reliability problems with registrar integration
- High availability prioritized

---

## 4. Frontend Implementation

### 4.1 File Structure

```
├── resume-site/                # Static website
   ├── robots.txt			    # Block "/images/" from search engines	
   ├── sitemap.xml
   ├── about.html
   ├── 1990s.html
   ├── 2000s.html
   ├── 2010s.html
   ├── 2020s.html
   ├── digital-media.html
   ├── professional.html	     # Resume
   ├── favicon-16.png
   ├── favicon-32.png
   ├── favicon.ico
   └── assets/
       ├── css/style.css
       └── images/
       └── js/main.js
```

### 4.2 UX & Styling

- Minimal modern layout
- Clean typography via Inter font
- Responsive grid galleries
- Lightbox implemented without external libraries
- Mobile nav via hamburger menu + external JS
- Consideration for dark mode

### 4.3 Resume Page

- Single, clean HTML page
- Professional narrative + key certifications
- Designed to be printable onto one page
- Visitor counter injected at runtime
- Accessible layout and semantic HTML

### 4.4 Lightbox

- Vanilla JavaScript
- Fullscreen overlay for artwork
- Esc and click-to-close supported
- CSP rules updated to allow required functionality

### 4.5 Image Watermarking

- One-time batch process (Python + Pillow) run via Lambda to apply a watermark to all artwork images in the S3 bucket.
- Protects portfolio images from unauthorized reuse while keeping the site's static-hosting model unchanged.
- Not an ongoing pipeline — new images added to the gallery must be watermarked using the same script before upload.

---

## 5. Security Hardening

### 5.1 CloudFront Security Headers

All configured at CloudFront, not inline:

- Strict-Transport-Security
- Content-Security-Policy (strict, no inline JS)
- X-Content-Type-Options
- Permissions-Policy
- Referrer-Policy
- X-Frame-Options

### 5.2 CSP Issues & Resolutions

- Initial CSP blocked Google Fonts → fixed by updating font-src
- `fetch()` to API Gateway blocked → updated connect-src
- Gallery images blocked → updated img-src

### 5.3 GuardDuty

- Enabled at the account level
- Provides passive threat detection across IAM, S3, CloudTrail, and Lambda

### 5.4 WAF (Planned)

- AWS Managed ruleset
- Optional bot control
- Rate limiting
- Alignment with CloudFront geo restrictions

---

## 6. Visitor Counter (Serverless Component)

### 6.1 Backend Architecture

- DynamoDB table: `site_visitors`
- Lambda function:
  - Atomically increments counter
  - Returns count as JSON
- API Gateway:
  - HTTPS endpoint
  - CORS allowed only from joelflood.com
- CloudWatch logging enabled

### 6.2 Frontend Integration

JS in main.js:

```javascript
fetch('https://hvmxivh8yg.execute-api.us-west-1.amazonaws.com/counter')
  .then(res => res.json())
  .then(data => {
    const el = document.getElementById('visitor-counter');
    if (el) el.textContent = `Visitors: ${data.visits || data.count || data.visitors}`;
  })
  .catch(() => {
    const el = document.getElementById('visitor-counter');
    if (el) el.textContent = 'Visitors: n/a';
  });
```

HTML element:

```html
<div id="visitor-counter" aria-live="polite"></div>
```

### CSP Note

CSP initially blocked the counter because `connect-src` was missing.

Resolved by adding:

```
connect-src https://hvmxivh8yg.execute-api.us-west-1.amazonaws.com;
```

---

## 7. Future Enhancements

- Full Terraform IaC rebuild
- GitHub Actions CI/CD pipeline
- Lighthouse automated performance checks
- Additional gallery pages (bicycles, Rebour archive)
- Art metadata index for future automation

---

## 8. Maintenance & Operations

### 8.1 Costs

- S3 storage: low
- CloudFront: a few dollars per month depending on bandwidth
- Route 53: standard domain + hosted zone pricing
- Lambda + DynamoDB: near free-tier usage

### 8.2 Backups

- S3 versioning protects all static site files, with older versions archived automatically via lifecycle rules.
- DynamoDB PITR enabled for the `site_visitors` table.
- GitHub maintains full history of source code and site content.

Backups rely on AWS-native features and require no additional operational overhead.


### 8.3 Monitoring

- CloudWatch Logs (Lambda + API Gateway)
- CloudTrail for configuration auditability
- GuardDuty for threat detection
- Billing alerts configured

---

## 9. Appendix

### 9.1 Resume Page

`professional.html` provides a modern one-page resume integrated into the site and includes certifications, experience, and visitor analytics.

---

