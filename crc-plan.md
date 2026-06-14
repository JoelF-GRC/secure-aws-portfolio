# Cloud Resume Challenge – Updated Project Plan  

This plan reflects the **final architecture, security posture, and functionality** currently implemented on **joelflood.com**.  
It expands beyond the original CRC requirements to include modern design, OAC-based S3 security, strict CSP headers, GuardDuty, geo-restriction tuning, and a scalable art‑focused structure.

---

## 1. Project Objectives

- Build a **secure, modern, minimalist portfolio website** hosted fully on AWS.  
- Prioritize **artwork presentation**, with a dedicated **professional resume** page.
- Implement the **Cloud Resume Challenge visitor counter** using Lambda, API Gateway, and DynamoDB.
- Apply **GRC and cloud security best practices**, including:
  - OAC (Origin Access Control)
  - Private S3 bucket (no public access)
  - Strict Content Security Policy (CSP)
  - GuardDuty for passive threat detection
  - CloudFront security headers
- Ensure site is fully **responsive**, gallery‑oriented, and optimized for mobile and dark mode.
- Document architecture, operations, and lessons learned in version-controlled Markdown.
- Prepare for eventual **Terraform IaC** and **GitHub‑based CI/CD** pipeline.

---

## 2. Final AWS Architecture

### **Frontend Stack**
- **Amazon S3** (private)
  - Stores all HTML, CSS, JS, and images  
  - No public access; only CloudFront via OAC

- **Amazon CloudFront**
  - CDN + TLS termination
  - HTTPS enforced
  - Response headers for security (HSTS, CSP, permissions policy, referrer policy)
  - Geo‑restriction allowlist
  - Custom error routing and caching rules

- **AWS Certificate Manager**
  - Certificates for joelflood.com + www

- **Route 53**
  - Apex and www aliases to CloudFront  
  - **DNSSEC disabled** due to resolver instability during testing

### **Backend (CRC Requirement)**

- **API Gateway**
  - HTTPS endpoint for visitor counter
  - CORS restricted to joelflood.com

- **AWS Lambda**
  - Atomic counter logic
  - Logs to CloudWatch

- **DynamoDB**
  - PK: site_visitors  
  - Stores integer visitor count  
  - PITR (point‑in‑time recovery) enabled

### **Monitoring & Security**

- **Amazon GuardDuty**
  - Account-wide threat detection  
  - No impact on site availability

- **CloudWatch**
  - Tracks Lambda execution
  - API Gateway call logs

- **CloudTrail**
  - Full API-level audit logs

- **CloudFront Security Headers**
  - Enforced through CloudFront, not inline
  - Strict CSP to prevent XSS or inline script use

---

## 3. Frontend Implementation Summary

### **Site Structure**

```
resume-site/
├── index.html
├── professional.html
├── about.html
├── 1990s.html
├── 2000s.html
├── 2010s.html
├── 2020s.html
├── digital-media.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/
└── robots.txt
└── sitemap.xml
```

### **UX and Styling**

- Clean, minimal design using **Inter** font  
- Responsive gallery grids emphasizing artwork  
- Custom Lightbox (CSP‑compliant, no external scripts)  
- Mobile navigation using external JS  
- Resume page printed cleanly onto a single page  
- Visitor counter added to resume footer

### **Visitor Counter Frontend Integration**

Performed using external JavaScript and fetch() API:

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

---

## 4. CRC Deliverables

| Requirement            | Implementation                                   |
| ---------------------- | ------------------------------------------------ |
| Static website         | Hosted privately in S3, delivered via CloudFront |
| HTTPS                  | ACM + CloudFront                                 |
| DNS                    | Route 53 with apex + www aliases                 |
| Visitor counter        | Lambda + DynamoDB + API Gateway                  |
| JavaScript call to API | External JS with CSP compliance                  |
| CI/CD (future)         | GitHub Actions deployment                        |
| IaC (future)           | Terraform rebuild                                |
| Extra security         | OAC, CSP, HSTS, GuardDuty, geo-restriction       |

---

## 5. Project Timeline (Updated)

### **Week 1**
- Architecture planning  
- HTML/CSS prototype  
- Initial CRC plan and diagrams  

### **Week 2**
- Built backend components (Lambda, API Gateway, DynamoDB)  
- Migrated site to S3 + CloudFront  
- Hardened CloudFront with CSP and security headers  
- Debugged DNSSEC failures → disabled DNSSEC  

### **Week 3**
- Integrated visitor counter  
- Tuned CSP (fonts, API calls, lightbox images)  
- Adjusted geo restrictions  
- Improved Lightbox + responsive galleries  

### **Future**
- Add CI/CD automation  
- Terraform IaC build  
- Lighthouse performance automation  
- Additional portfolio sections  

---

## 6. Security Posture Summary

### **Implemented**
- Private S3 bucket with OAC  
- Strict CSP (no inline JS)  
- HSTS (preload format)  
- Referrer-Policy  
- Permissions-Policy  
- GuardDuty enabled  
- CloudTrail logging  
- CloudWatch monitoring  
- Geo-restriction  
- API CORS locked down  

### **Benefit**
Provides cloud-native defense in depth, strong browser security posture, and clean audit trails.

---

## 7. Backups & Reliability

- S3 versioning enabled to retain prior versions of site assets; older versions transition to Glacier Deep Archive automatically.
- DynamoDB PITR enabled for the visitor counter table to allow point-in-time restores.
- GitHub provides full revision history for code and content.

Simple, low-maintenance controls that align with the lightweight nature of the project.

---

## 8. Next Steps (Possible future items)

- Full Terraform IaC implementation  
- Complete GitHub Actions CI/CD pipeline  
- Add AWS WAF Managed Rules  
- Enhance functionality around gallery metadata  
- Expand the professional GRC documentation  

---
