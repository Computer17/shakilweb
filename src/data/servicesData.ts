import { ServiceItem } from '../types';

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'pdf-to-word',
    slug: 'pdf-to-word',
    title: 'PDF → Word Conversion',
    category: 'Document Conversion',
    iconName: 'FileText',
    shortIntro: 'Clean, accurate conversion from non-editable PDF documents into fully formatted Word files.',
    fullExplanation:
      'I meticulously convert your PDF documents, scanned books, forms, or notes into clean, editable Microsoft Word (.docx) files. Unlike raw online tools that break alignments, I preserve exact margins, headers, footers, table structures, fonts, and inline images.',
    included: [
      'Exact layout & formatting retention',
      'Table & paragraph alignment preserving',
      'Manual proofreading for optical character recognition (OCR) errors',
      'Editable images, headers, and footers',
      'Clean typography and spacing standard',
    ],
    notIncluded: [
      'Rewriting or reauthoring core document content',
      'Translating text to another language (available via Translation service)',
      'Designing brand-new graphic illustrations',
    ],
    requiredFiles: [
      'Original PDF document(s)',
      'Scanned pages or image files (if PDF is scan-based)',
    ],
    requiredInfo: [
      'Specific page numbers to convert (if not entire document)',
      'Preferred font style or template requirements (if any)',
      'Special instructions for non-standard tables or equations',
    ],
    estimatedDelivery: '2 - 6 Hours',
    pricingType: 'fixed',
    priceAmount: 150,
    priceUnit: 'per 10 pages',
    currency: 'BDT',
    examples: [
      {
        title: '30-Page Scanned Legal Document',
        description: 'Converted scanned PDF legal pages into clean editable DOCX with perfect section numbering.',
        tag: 'Document Conversion',
      },
      {
        title: 'Corporate Financial Report',
        description: 'Preserved complex multi-column layouts, embedded graphics, and tables into Word format.',
        tag: 'Business Formatting',
      },
    ],
    faqs: [
      {
        question: 'Will scanned or hand-written PDFs work?',
        answer: 'Scanned typed text works accurately with OCR + manual verification. Hand-written text can be typed manually via the Computer Typing service.',
      },
      {
        question: 'Will tables and headers remain editable in Word?',
        answer: 'Yes! All tables will be genuine Word tables, not images, so you can freely modify numbers and text.',
      },
    ],
  },
  {
    id: 'pdf-to-excel',
    slug: 'pdf-to-excel',
    title: 'PDF → Excel Conversion',
    category: 'Data & Spreadsheets',
    iconName: 'FileSpreadsheet',
    shortIntro: 'Transform PDF bank statements, invoices, and tabular reports into clean, structured Excel sheets.',
    fullExplanation:
      'Convert static PDF tables into fully interactive Microsoft Excel (.xlsx) files. I ensure numeric columns stay formatted as clean numbers, dates parse properly, formulas are set up where needed, and multi-page tables are seamlessly stitched into unified sheets.',
    included: [
      'Clean tabular extraction into XLSX format',
      'Proper cell data types (currency, numbers, dates, text)',
      'Removal of page breaks, header noise, and unwanted line breaks',
      'Multi-page table stitching into unified worksheet',
      'Basic formula setup (Sums, averages) on request',
    ],
    notIncluded: [
      'Advanced financial auditing or tax consulting',
      'Automated VBA macro scripting (available via Automation service)',
    ],
    requiredFiles: [
      'PDF file containing tables, bank statements, or invoices',
    ],
    requiredInfo: [
      'Which sheets or tables need extraction',
      'Desired sheet organization (separate tabs or single sheet)',
      'Any special formatting or calculation requirements',
    ],
    estimatedDelivery: '3 - 8 Hours',
    pricingType: 'fixed',
    priceAmount: 200,
    priceUnit: 'per 10 pages',
    currency: 'BDT',
    examples: [
      {
        title: '12-Month Bank Statement Extraction',
        description: 'Extracted 120 pages of bank transactions into a sorted Excel master sheet with clean date formatting.',
        tag: 'Financial Data',
      },
      {
        title: 'Supplier Invoice Batch',
        description: 'Converted 45 PDF invoices into structured line-item spreadsheets with total calculations.',
        tag: 'Invoicing Data',
      },
    ],
    faqs: [
      {
        question: 'Can you combine multiple PDF tables into one Excel sheet?',
        answer: 'Yes, I can consolidate tables from multiple PDFs into one unified Excel tab or structured sheet.',
      },
      {
        question: 'How are numbers and currencies formatted?',
        answer: 'All numbers are formatted as actual numeric values so formulas like SUM() work immediately without text errors.',
      },
    ],
  },
  {
    id: 'typing',
    slug: 'typing',
    title: 'Computer Typing (Bengali & English)',
    category: 'Data & Typing',
    iconName: 'Keyboard',
    shortIntro: 'Fast, highly accurate touch typing in English and Bengali (Bijoy / Avro) from audio, scans, or handwritten notes.',
    fullExplanation:
      'Professional typing services with 99%+ accuracy and strict adherence to formatting rules. I handle English and Bengali typing for manuscripts, exam papers, official letters, meeting minutes, and academic notes.',
    included: [
      'High speed touch typing in English and Bengali',
      'Bijoy Unicode / Avro keyboard layout compliance',
      'Spell check, punctuation correction, and formatting',
      'Delivery in DOCX, PDF, or Plain Text formats',
      'Table and list formatting where required',
    ],
    notIncluded: [
      'Translating content during typing (see Translation service)',
      'Proofreading unreadable or destroyed handwritten documents',
    ],
    requiredFiles: [
      'Scanned photos, clear camera shots, or handwritten pages',
      'Audio recording file (if audio typing required)',
    ],
    requiredInfo: [
      'Target font (e.g. SutonnyMJ, Kalpurush, Arial, Times New Roman)',
      'Document orientation and line spacing preference',
    ],
    estimatedDelivery: '2 - 12 Hours',
    pricingType: 'fixed',
    priceAmount: 100,
    priceUnit: 'per 1000 words',
    currency: 'BDT',
    examples: [
      {
        title: '50-Page Academic Bengali Manuscript',
        description: 'Typed handwritten Bengali research paper into clean Bijoy Unicode Word document.',
        tag: 'Bengali Typing',
      },
      {
        title: 'English Business Contract Drafts',
        description: 'Accurate typing of legal contract notes with structured sub-clauses and formatting.',
        tag: 'English Typing',
      },
    ],
    faqs: [
      {
        question: 'Do you support both English and Bengali in the same document?',
        answer: 'Yes, dual-language documents with mixed English and Bengali typography are fully supported.',
      },
    ],
  },
  {
    id: 'translation',
    slug: 'translation',
    title: 'Translation (Bengali ↔ English)',
    category: 'Content Services',
    iconName: 'Languages',
    shortIntro: 'Natural, culturally accurate translation between English and Bengali without robotic machine flaws.',
    fullExplanation:
      'Human-guided translation for documents, websites, apps, marketing materials, and legal disclosures between English and Bengali. Focuses on natural flow, context preservation, and correct tone rather than literal word-for-word translation.',
    included: [
      'Context-aware English ↔ Bengali translation',
      'Manual proofreading for idiomatic fluency',
      'Technical, corporate, or informal tone adjustment',
      'Original layout and formatting retention',
    ],
    notIncluded: [
      'Notarized official legal swearing (unless standard certified digital translation)',
    ],
    requiredFiles: [
      'Source text file, PDF, Word doc, or website copy link',
    ],
    requiredInfo: [
      'Target audience and desired tone (formal, professional, casual)',
      'Any specific glossary or key industry terms to keep unchanged',
    ],
    estimatedDelivery: '4 - 24 Hours',
    pricingType: 'fixed',
    priceAmount: 250,
    priceUnit: 'per 500 words',
    currency: 'BDT',
    examples: [
      {
        title: 'E-commerce Terms of Service & Privacy Policy',
        description: 'Translated English legal policy into clear, natural Bengali for local compliance.',
        tag: 'Legal/Policy',
      },
      {
        title: 'SaaS Mobile App UI Localization',
        description: 'Localized 800+ UI strings into Bengali for an Android health app.',
        tag: 'UI Localization',
      },
    ],
    faqs: [
      {
        question: 'Is this automated machine translation?',
        answer: 'No. AI tools are only used for speed assistance; every single sentence is human-reviewed and refined for natural reading.',
      },
    ],
  },
  {
    id: 'data-entry',
    slug: 'data-entry',
    title: 'Data Entry & Spreadsheet Cleanup',
    category: 'Data & Spreadsheets',
    iconName: 'Database',
    shortIntro: 'Clean, accurate, and structured data entry into Excel, Google Sheets, databases, or CRM platforms.',
    fullExplanation:
      'Eliminate human errors and clutter in your databases and spreadsheets. I assist with high-volume data entry, deduplication, field standardization, sorting, tagging, and cross-checking records with 100% accuracy.',
    included: [
      'Manual or automated data entry into Sheets/Excel/CRM',
      'Data cleaning (removing duplicates, trimming spaces, fixing capitalizations)',
      'Standardizing addresses, phones, names, and product codes',
      'Data validation rules and dropdown setup',
    ],
    notIncluded: [
      'Phishing, scraping illegal email lists, or spam data generation',
    ],
    requiredFiles: [
      'Source raw data files (PDFs, images, lists, CSVs)',
      'Target template file or spreadsheet link',
    ],
    requiredInfo: [
      'Clear description of data fields to populate',
      'Validation criteria or formatting rules',
    ],
    estimatedDelivery: '4 - 24 Hours',
    pricingType: 'fixed',
    priceAmount: 300,
    priceUnit: 'per 500 entries',
    currency: 'BDT',
    examples: [
      {
        title: '5,000 Contact List Deduplication & Cleaning',
        description: 'Cleaned messy client directory, split full names, standardized phone numbers into E.164 format.',
        tag: 'Data Cleanup',
      },
    ],
    faqs: [
      {
        question: 'Can you work directly in Google Sheets?',
        answer: 'Yes! I can work directly inside shared Google Sheets or export clean Excel / CSV files for you.',
      },
    ],
  },
  {
    id: 'web-research',
    slug: 'web-research',
    title: 'Web Research & Data Collection',
    category: 'Research',
    iconName: 'Search',
    shortIntro: 'Thorough online research, market information gathering, contact discovery, and structured summary reports.',
    fullExplanation:
      'Get verified factual information tailored to your business needs. I gather targeted data, company details, market prices, competitor info, and industry statistics into clean organized spreadsheets or summaries.',
    included: [
      'In-depth web searching and fact verification',
      'Vendor, supplier, or service provider comparison tables',
      'Contact details discovery (Public email, phone, location, website)',
      'Structured presentation in Excel / Word / PDF',
    ],
    notIncluded: [
      'Gathering illegal private personal data or password hacking',
      'Unsolicited spamming or cold messaging',
    ],
    requiredFiles: [
      'Reference document or requirement brief (if any)',
    ],
    requiredInfo: [
      'Target industry, region, or topic',
      'Specific data fields required (e.g. Name, Website, Price, Rating)',
      'Quantity of records needed',
    ],
    estimatedDelivery: '6 - 24 Hours',
    pricingType: 'discussion',
    priceAmount: 400,
    priceUnit: 'per project',
    currency: 'BDT',
    examples: [
      {
        title: 'Top 50 Software Agencies in Dhaka Directory',
        description: 'Researched verified contacts, services, and portfolio links for leading IT firms into a master sheet.',
        tag: 'Market Research',
      },
    ],
    faqs: [
      {
        question: 'How do you ensure data accuracy?',
        answer: 'Every record is double-checked directly from official websites, official directories, and verified public sources.',
      },
    ],
  },
  {
    id: 'image-editing',
    slug: 'image-editing',
    title: 'Image Editing & Background Removal',
    category: 'Design & Media',
    iconName: 'Image',
    shortIntro: 'Clean background removal, product photo retouching, cropping, resizing, and shadow creation for e-commerce.',
    fullExplanation:
      'High-quality photo editing tailored for product catalogs, social media, and presentations. I provide transparent background removal, clipping paths, natural drop shadow creation, color adjustment, and image optimization.',
    included: [
      'Precise background removal (transparent PNG or clean white background)',
      'Product photo retouching and contrast adjustment',
      'Natural drop shadow or reflection shadow addition',
      'Resizing and cropping for Shopify, WooCommerce, or Amazon',
    ],
    notIncluded: [
      '3D modeling or complex digital painting from scratch',
      'Forging fake identity documents or certificates',
    ],
    requiredFiles: [
      'High-resolution original photos (JPG, PNG, WEBP, RAW)',
    ],
    requiredInfo: [
      'Output background color (Transparent, Pure White #FFFFFF, or Custom)',
      'Target pixel dimensions or platform requirements (e.g. 1000x1000px)',
    ],
    estimatedDelivery: '2 - 12 Hours',
    pricingType: 'fixed',
    priceAmount: 150,
    priceUnit: 'per 10 images',
    currency: 'BDT',
    examples: [
      {
        title: '50 E-commerce Clothing Photos',
        description: 'Isolated products, removed backgrounds, added soft floor shadows for an online store catalog.',
        tag: 'E-commerce Photos',
      },
    ],
    faqs: [
      {
        question: 'What format will I receive?',
        answer: 'You will receive high-quality transparent PNGs, standard JPGs, or WebP files optimized for fast web loading.',
      },
    ],
  },
  {
    id: 'website-fix',
    slug: 'website-fix',
    title: 'Small Website Fix & Maintenance',
    category: 'Web Development',
    iconName: 'Wrench',
    shortIntro: 'Fast troubleshooting for broken layouts, CSS bugs, mobile display issues, forms, and small script errors.',
    fullExplanation:
      'Is your website showing broken layouts on mobile, failing forms, or slow loading? I diagnose and fix HTML, CSS, JavaScript, React, WordPress, and web styling issues promptly.',
    included: [
      'Mobile responsiveness & layout alignment fixes',
      'CSS styling, font, and button hover corrections',
      'Contact form email sending fix',
      'SSL / HTTP redirection checks',
      'Performance tweak and clean code adjustment',
    ],
    notIncluded: [
      'Building a massive multi-page web application from scratch (discussed separately)',
      'Server root hacking or server hardware restoration',
    ],
    requiredFiles: [
      'Website URL or screenshot of the bug',
    ],
    requiredInfo: [
      'Description of the exact issue and steps to reproduce',
      'Access details (FTP, cPanel, or GitHub repository access if required)',
    ],
    estimatedDelivery: '3 - 12 Hours',
    pricingType: 'discussion',
    priceAmount: 500,
    priceUnit: 'per task',
    currency: 'BDT',
    examples: [
      {
        title: 'Mobile Navigation Bar Overlap Fix',
        description: 'Fixed broken z-index and drawer alignment on smartphone viewports for a local business site.',
        tag: 'CSS/Mobile Fix',
      },
    ],
    faqs: [
      {
        question: 'Will my website stay online while you fix it?',
        answer: 'Yes! Minor CSS/JS fixes are tested safely before applying to live sites, avoiding downtime.',
      },
    ],
  },
  {
    id: 'product-listing',
    slug: 'product-listing',
    title: 'Product Listing (Shopify / WooCommerce)',
    category: 'E-commerce',
    iconName: 'ShoppingBag',
    shortIntro: 'Accurate product uploads with optimized titles, categories, pricing, SKU codes, and variant management.',
    fullExplanation:
      'Populate your online store quickly and accurately. I manage product listings for Shopify, WooCommerce, Daraz, or custom e-commerce stores, ensuring clean titles, structured descriptions, tags, pricing, and variants.',
    included: [
      'Product title, description, and key features formatting',
      'Image upload & main featured image setup',
      'Price, sale price, inventory, and SKU entry',
      'Variants configuration (Color, Size, Material)',
      'Category & tags mapping',
    ],
    notIncluded: [
      'Copywriting fake reviews or false medical health claims',
    ],
    requiredFiles: [
      'Product catalog spreadsheet or supplier links',
      'Folder of product images named by SKU or title',
    ],
    requiredInfo: [
      'Target store platform link & store credentials / collaborator code',
      'Default tax or shipping class guidelines',
    ],
    estimatedDelivery: '6 - 24 Hours',
    pricingType: 'fixed',
    priceAmount: 300,
    priceUnit: 'per 20 products',
    currency: 'BDT',
    examples: [
      {
        title: '100 Apparel Products Upload to Shopify',
        description: 'Uploaded 100 t-shirt designs with size/color matrix variants, price formatting, and tagged collections.',
        tag: 'Shopify Uploads',
      },
    ],
    faqs: [
      {
        question: 'Which e-commerce platforms do you support?',
        answer: 'Shopify, WooCommerce, OpenCart, Wix eCommerce, Daraz seller center, and custom admin portals.',
      },
    ],
  },
  {
    id: 'automation',
    slug: 'automation',
    title: 'Automation & Scripting',
    category: 'Automation',
    iconName: 'Zap',
    shortIntro: 'Custom scripts and workflow automations to connect apps, generate PDF reports, or streamline repetitive tasks.',
    fullExplanation:
      'Save hours of manual effort through smart scripting and workflow automation. I create custom scripts (Python, Node.js, Google Apps Script, Excel Macros) to automate data syncing, automated email alerts, PDF invoice generation, and API integrations.',
    included: [
      'Google Sheets Apps Script automation (Auto email alerts, PDF generation)',
      'Excel VBA macro or formula automation',
      'Zapier / Make.com workflow setup',
      'Simple web scraping or API connector scripts (compliant with platform rules)',
      'Clear documentation on how to run or schedule the script',
    ],
    notIncluded: [
      'CAPTCHA bypass tools or unethical spam bot development',
    ],
    requiredFiles: [
      'Sample input files and expected output template',
    ],
    requiredInfo: [
      'Step-by-step description of the manual process to automate',
      'Platform credentials or API keys (if applicable)',
    ],
    estimatedDelivery: '12 - 48 Hours',
    pricingType: 'discussion',
    priceAmount: 1000,
    priceUnit: 'per script',
    currency: 'BDT',
    examples: [
      {
        title: 'Google Sheets Auto-PDF Invoice Emailer',
        description: 'Built Apps Script that generates branded PDF invoice from new sheet rows and auto-emails to clients.',
        tag: 'Apps Script',
      },
    ],
    faqs: [
      {
        question: 'Do I need to pay monthly subscription fees for automation scripts?',
        answer: 'No! Standalone Google Apps Script and Node/Python scripts run directly without monthly SaaS fees.',
      },
    ],
  },
];
