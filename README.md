# 💰 RecoverOS — AI Revenue Recovery

RecoverOS is an innovative AI-powered revenue recovery platform designed to detect and address revenue at risk from payment failures, checkout abandonment, failed subscriptions, and overdue B2B payments. Utilizing intelligent AI agents, it identifies root causes, selects optimal recovery actions (like Razorpay Payment Links and Brevo email communication), applies crucial guardrails, and executes workflows seamlessly. It offers real-time execution tracking and a comprehensive audit trail, empowering businesses to recover lost revenue efficiently through AI-driven diagnosis, confidence-based decisions, and provider-failure fallbacks.

## 🌐 Live Demo
Experience RecoverOS in action: [https://recover-os-green.vercel.app/](https://recover-os-green.vercel.app/)

## ✨ Features
- ✨ AI-powered risk detection for payment failures and abandoned checkouts.
- 🔍 Root cause analysis using intelligent AI agents.
- ✅ Automated selection of optimal recovery actions (Email, Payment Link, Voice, Account Manager).
- 🛡️ Built-in guardrails for validated recovery workflows and provider-failure fallbacks.
- 🔗 Integration with Razorpay Payment Links for quick transaction recovery.
- 📧 Brevo email communication for automated customer outreach.
- 📊 Real-time execution tracking and comprehensive audit trails for every recovery action.
- 📈 Confidence-based decision making for effective revenue recovery strategies.

## 🛠️ Tech Stack
**Frontend:** Next.js, React, Tailwind CSS, JavaScript
**Backend:** Node.js, Express.js, Socket.IO
**Database:** MongoDB, Mongoose
**APIs/Services:** Razorpay API, Brevo API
**AI/ML:** nvidia/nemotron-3.5-lightning-30b-a3b api

## 🚀 Installation
Follow these steps to set up and run the project locally.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/recoveros.git
    cd recoveros
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

### ⚙️ Environment Variables
Create a `.env` file in the root directory and add your environment variables like API keys and database connection strings.
```
DATABASE_URL=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
BREVO_API_KEY=your_brevo_api_key
NEMOTRON_API_KEY=your_nemotron_api_key
```

## 📖 Usage / How it Works
RecoverOS streamlines revenue recovery through an intelligent, automated workflow:

1.  Open the RecoverOS dashboard.
2.  Generate or ingest a revenue event.
3.  Review the detected payment or revenue issue.
4.  AI analyzes the event and identifies the root cause.
5.  AI selects the appropriate recovery action such as Email, Payment Link, Voice, or Account Manager.
6.  Guardrails validate the selected action.
7.  Execute the recovery workflow.
8.  Razorpay generates a payment link when required.
9.  Brevo sends the recovery email to the customer.
10. Monitor the recovery status and complete execution trail in real time.

## 📁 Folder Structure
```
recoveros/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js app directory (pages, API routes)
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utility functions, helpers
│   ├── models/                 # Mongoose models for MongoDB
│   ├── styles/                 # Tailwind CSS configurations
│   └── utils/                  # Helper utilities
├── server/                     # Express.js backend (if separate)
│   ├── routes/
│   ├── controllers/
│   └── index.js
├── .env                        # Environment variables
├── next.config.js              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── README.md                   # This file
└── tsconfig.json               # TypeScript configuration
```

## 🤝 Contributions
We welcome contributions to RecoverOS! If you'd like to contribute, please follow these steps:

1.  Fork the repository
2.  Clone your fork: `git clone https://github.com/your-username/recoveros.git`
3.  Create a new branch: `git checkout -b feature/your-feature-name`
4.  Make your changes and commit them: `git commit -m "feat: Add new feature"`
5.  Push to your fork: `git push origin feature/your-feature-name`
6.  Submit a pull request to the `main` branch of the original repository.

## 🔮 Upcoming Features
- 🚀 Integration with additional payment gateways and financial services.
- 🗣️ Voice-based recovery options and automated IVR integration.
- ⚡ Enhanced AI models for predictive analytics and proactive risk mitigation.
- 🎨 Customizable dashboard and reporting for tailored business insights.
- 📱 Mobile application for on-the-go monitoring and recovery management.

## 📄 License
This project is licensed under the [MIT License](LICENSE).

## ✉️ Contact
Chaitanya Khurana
chaitanyakhurana.workk@gmail.com

❤️ This README was written by **ReadmeAI** for fast and professional documentation.
