
export interface RoadmapItem {
    id: string | number;
    title: string;
    field: string;
    color: 'blue' | 'purple' | 'emerald' | 'amber' | 'orange' | 'cyan' | 'pink';
    steps: string[];
    quiz_data?: any[];
}

export const PREDEFINED_ROADMAPS: RoadmapItem[] = [
    { id: 'fe', title: 'Frontend Developer', field: 'Development', color: 'blue', steps: ['HTML/CSS Basics', 'JavaScript ES6+', 'React/Vue/Angular', 'State Management', 'Build Tools', 'Testing'] },
    { id: 'be', title: 'Backend Developer', field: 'Development', color: 'blue', steps: ['Server Basics', 'Node.js/Python/Go', 'Databases (SQL/NoSQL)', 'API Design', 'Authentication', 'Caching'] },
    { id: 'fs', title: 'Full-Stack Developer', field: 'Development', color: 'blue', steps: ['Frontend Basics', 'Backend Logic', 'Database Integration', 'DevOps Basics', 'System Design'] },
    { id: 'm-ios', title: 'iOS Developer', field: 'Mobile', color: 'cyan', steps: ['Swift Basics', 'UIKit/SwiftUI', 'CoreData', 'Networking', 'App Store Publishing'] },
    { id: 'm-and', title: 'Android Developer', field: 'Mobile', color: 'cyan', steps: ['Kotlin Basics', 'Android SDK', 'Jetpack Compose', 'Room Database', 'Google Play Publishing'] },
    { id: 'm-cross', title: 'Cross-Platform Mobile', field: 'Mobile', color: 'cyan', steps: ['React Native/Flutter', 'Native Bridges', 'State Management', 'Deploying to Stores'] },
    { id: 'devops', title: 'DevOps Engineer', field: 'Operations', color: 'orange', steps: ['Linux Basics', 'Scripting (Bash/Python)', 'Docker/K8s', 'CI/CD Pipelines', 'Cloud Providers'] },
    { id: 'sre', title: 'Site Reliability Engineer', field: 'Operations', color: 'orange', steps: ['System Internals', 'Observability', 'Incident Management', 'Performance Tuning', 'Automation'] },
    { id: 'gd-unity', title: 'Game Developer (Unity)', field: 'Game Dev', color: 'purple', steps: ['C# Programming', 'Unity Engine', 'Physics & Math', 'Game Patterns', 'Optimization'] },
    { id: 'gd-unreal', title: 'Game Developer (Unreal)', field: 'Game Dev', color: 'purple', steps: ['C++ Programming', 'Unreal Engine', 'Blueprints', 'Shaders', 'Networking'] },
    { id: 'ds', title: 'Data Scientist', field: 'Data', color: 'emerald', steps: ['Statistics & Math', 'Python/R', 'EDA', 'Machine Learning', 'Data Visualization'] },
    { id: 'da', title: 'Data Analyst', field: 'Data', color: 'emerald', steps: ['Excel/Spreadsheets', 'SQL Mastery', 'Tableau/PowerBI', 'Python Basics', 'Reporting'] },
    { id: 'de', title: 'Data Engineer', field: 'Data', color: 'emerald', steps: ['ETL Pipelines', 'Big Data Tools (Spark)', 'Data Warehousing', 'Cloud Data Services', 'Workflow Orchestration'] },
    { id: 'ml', title: 'Machine Learning Engineer', field: 'AI', color: 'pink', steps: ['ML Algorithms', 'Deep Learning (PyTorch/TF)', 'Model Serving', 'MLOps', 'Feature Engineering'] },
    { id: 'ai-res', title: 'AI Researcher', field: 'AI', color: 'pink', steps: ['Advanced Math', 'Paper Reading/Writing', 'Novel Architecture', 'Experimentation', 'Conferences'] },
    { id: 'nlp', title: 'NLP Engineer', field: 'AI', color: 'pink', steps: ['Linguistics Basics', 'Text Processing', 'Transformers/LLMs', 'Fine-tuning', 'Prompt Engineering'] },
    { id: 'cv', title: 'Computer Vision Engineer', field: 'AI', color: 'pink', steps: ['Image Processing', 'OpenCV', 'CNNs/ViTs', 'Object Detection', '3D Vision'] },
    { id: 'sec-ana', title: 'Cybersecurity Analyst', field: 'Security', color: 'amber', steps: ['Network Basics', 'Threat Analysis', 'SIEM Tools', 'Incident Response', 'Compliance'] },
    { id: 'pen', title: 'Penetration Tester', field: 'Security', color: 'amber', steps: ['Reconnaissance', 'Exploitation', 'Web App Tech', 'Network Attacks', 'Reporting'] },
    { id: 'sec-eng', title: 'Security Engineer', field: 'Security', color: 'amber', steps: ['Secure Coding', 'AppSec', 'Infra Security', 'IAM', 'Encryption'] },
    { id: 'cloud-aws', title: 'Cloud Architect (AWS)', field: 'Cloud', color: 'blue', steps: ['AWS Core Services', 'VPC Networking', 'IAM Policies', 'Cost Optimization', 'Migration Strategies'] },
    { id: 'cloud-az', title: 'Cloud Architect (Azure)', field: 'Cloud', color: 'blue', steps: ['Azure Active Directory', 'Virtual Machines', 'App Services', 'Hybrid Cloud', 'Security'] },
    { id: 'cloud-gcp', title: 'Cloud Architect (GCP)', field: 'Cloud', color: 'blue', steps: ['Compute Engine', 'GKE', 'BigQuery', 'VPC Design', 'Anthos'] },
    { id: 'qa', title: 'QA Engineer', field: 'Testing', color: 'cyan', steps: ['Testing Fundamentals', 'Bug Tracking', 'Test Plans', 'Manual Testing', 'Agile Processes'] },
    { id: 'qa-auto', title: 'QA Automation Engineer', field: 'Testing', color: 'cyan', steps: ['Selenium/Cypress', 'Language Basics', 'CI Integration', 'API Testing', 'Performance Testing'] },
    { id: 'bc', title: 'Blockchain Developer', field: 'Web3', color: 'orange', steps: ['Cryptography', 'Smart Contracts', 'Solidity/Rust', 'DApps', 'Consensus Mechanisms'] },
    { id: 'sc-dev', title: 'Smart Contract Auditor', field: 'Web3', color: 'orange', steps: ['EVM Internals', 'Security Vulnerabilities', 'Auditing Tools', 'Attack Vectors', 'Reporting'] },
    { id: 'ui', title: 'UI Designer', field: 'Design', color: 'purple', steps: ['Design Principles', 'Typography/Color', 'Figma/Sketch', 'Prototyping', 'Design Systems'] },
    { id: 'ux', title: 'UX Researcher', field: 'Design', color: 'purple', steps: ['User Research Methods', 'Usability Testing', 'Personas', 'User Journeys', 'Analytics'] },
    { id: 'pm', title: 'Product Manager', field: 'Management', color: 'blue', steps: ['Product Lifecycle', 'Market Research', 'Agile/Scrum', 'Roadmapping', 'Stakeholder Management'] },
    { id: 'scrum', title: 'Scrum Master', field: 'Management', color: 'blue', steps: ['Agile Manifesto', 'Scrum Events', 'Coaching', 'Removing Blockers', 'Metrics'] },
    { id: 'tech-lead', title: 'Tech Lead', field: 'Management', color: 'blue', steps: ['System Architecture', 'Code Review', 'Mentorship', 'Technical Decisions', 'Communication'] },
    { id: 'em', title: 'Engineering Manager', field: 'Management', color: 'blue', steps: ['People Management', 'Hiring', 'Performance Reviews', 'Team Culture', 'Strategic Planning'] },
    { id: 'cto', title: 'Chief Technology Officer', field: 'Management', color: 'blue', steps: ['Business Strategy', 'Tech Vision', 'Budgeting', 'Executive Leadership', 'Scalability'] },
    { id: 'sys-admin', title: 'Systems Administrator', field: 'Operations', color: 'cyan', steps: ['OS Management', 'User Management', 'Scripting', 'Backup/Restore', 'Security Patching'] },
    { id: 'net-eng', title: 'Network Engineer', field: 'Infrastructure', color: 'cyan', steps: ['TCP/IP', 'Routing/Switching', 'Firewalls', 'VPNs', 'Network Monitoring'] },
    { id: 'dba', title: 'Database Administrator', field: 'Infrastructure', color: 'cyan', steps: ['SQL Deep Dive', 'Performance Tuning', 'Backups', 'Replication', 'Security'] },
    { id: 'emb', title: 'Embedded Systems Engineer', field: 'Hardware', color: 'orange', steps: ['C/C++', 'Microcontrollers', 'RTOS', 'Device Drivers', 'Hardware Interfaces'] },
    { id: 'iot', title: 'IoT Developer', field: 'Hardware', color: 'orange', steps: ['Sensors/Actuators', 'IoT Protocols (MQTT)', 'Edge Computing', 'Cloud IoT Platforms', 'Security'] },
    { id: 'robo', title: 'Robotics Engineer', field: 'Hardware', color: 'orange', steps: ['ROS', 'Kinematics', 'Control Theory', 'C++', 'Computer Vision'] },
    { id: 'ar-vr', title: 'AR/VR Developer', field: 'Game Dev', color: 'purple', steps: ['Unity/Unreal', '3D Math', 'XR SDKs', 'Performance Optimization', 'Interaction Design'] },
    { id: 'gfx', title: 'Graphics Programmer', field: 'Game Dev', color: 'purple', steps: ['Linear Algebra', 'OpenGL/Vulkan/DirectX', 'Shader Languages', 'Rendering Pipelines', 'Optimization'] },
    { id: 'os-dev', title: 'OS Developer', field: 'Systems', color: 'emerald', steps: ['Assembly/C', 'Kernel Internals', 'Memory Management', 'Process Scheduling', 'File Systems'] },
    { id: 'compiler', title: 'Compiler Engineer', field: 'Systems', color: 'emerald', steps: ['Automata Theory', 'Parsing', 'ASTs', 'Optimization', 'Code Generation'] },
    { id: 'firmware', title: 'Firmware Engineer', field: 'Systems', color: 'emerald', steps: ['Computer Architecture', 'C/Assembly', 'Board Bring-up', 'Debugging', 'Low-level protocols'] },
    { id: 'tech-writer', title: 'Technical Writer', field: 'Other', color: 'pink', steps: ['Writing Skills', 'Documentation Tools', 'API Docs', 'Information Architecture', 'Editing'] },
    { id: 'devrel', title: 'Developer Relations', field: 'Other', color: 'pink', steps: ['Public Speaking', 'Content Creation', 'Community Management', 'Coding Skills', 'Marketing Basics'] },
    { id: 'sales-eng', title: 'Sales Engineer', field: 'Other', color: 'pink', steps: ['Product Knowledge', 'Presentation Skills', 'Technical Demos', 'Sales Process', 'Problem Solving'] },
    { id: 'sup-eng', title: 'Support Engineer', field: 'Other', color: 'pink', steps: ['Troubleshooting', 'Customer Service', 'OS/Network Basics', 'Documentation', 'Escalation Processes'] },
    { id: 'it-spec', title: 'IT Specialist', field: 'Operations', color: 'cyan', steps: ['Hardware Troubleshooting', 'Help Desk', 'Asset Management', 'Software Installation', 'Network Basics'] }
];

export const GENERIC_PREDEFINED_QUIZ = [
    {
        question: "Which of the following is considered a core foundational concept in this roadmap's domain?",
        options: ["Microservice deployment", "Memory management", "Fundamental theory and syntax", "Load balancing algorithms"],
        correctIndex: 2
    },
    {
        question: "What is typically the primary goal when applying the advanced methodologies of this track?",
        options: ["Scaling infrastructure", "Optimizing performance and correctness", "Deprecating old systems", "Marketing generation"],
        correctIndex: 1
    },
    {
        question: "During practical application, which testing strategy is universally recommended?",
        options: ["Ignoring edge cases", "Deploying directly to production", "Comprehensive unit and integration testing", "Only testing happy paths"],
        correctIndex: 2
    },
    {
        question: "Which pattern strictly dictates the separation of concerns in modern architecture?",
        options: ["Monolithic convergence", "Spaghetti coding", "Modular design patterns", "Circular dependencies"],
        correctIndex: 2
    },
    {
        question: "To achieve total mastery in this field, what must a professional continuously do?",
        options: ["Memorize deprecated documentation", "Adapt to emerging standards and continuous learning", "Rely entirely on AI templates", "Avoid looking at source code"],
        correctIndex: 1
    }
];
