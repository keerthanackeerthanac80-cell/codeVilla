// ============================================
// COURSE DATA — FLYING AI LEARNING VILLA
// 8 Courses arranged in villa rooms
// ============================================

export interface Course {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;       // emoji icon for the hologram
  color: string;      // primary color hex
  colorRgb: string;   // RGB for glow effects
  gradient: string;   // CSS gradient
  videoSrc: string;   // path to /public/videos/
  duration: string;   // estimated duration
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  position: [number, number, number]; // 3D position in villa scene
  roomLabel: string;  // which wing/room
}

export const COURSES: Course[] = [
  {
    id: 'python',
    title: 'Python Development',
    shortTitle: 'Python',
    description:
      'Master Python programming from fundamentals to advanced concepts. Build real-world applications, automate tasks, and create powerful scripts with the world\'s most versatile language.',
    icon: '🐍',
    color: '#3B82F6',
    colorRgb: '59, 130, 246',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    videoSrc: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    duration: '12 Hours',
    difficulty: 'Beginner',
    topics: [
      'Python Fundamentals',
      'Data Structures',
      'OOP Concepts',
      'File Handling',
      'Error Handling',
      'Modules & Packages',
      'Web Scraping',
      'API Development',
    ],
    position: [-6, 0, -3],
    roomLabel: 'West Wing — Room 1',
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytics',
    shortTitle: 'Data Science',
    description:
      'Dive deep into data science methodologies. Learn to extract insights from complex datasets using statistical analysis, visualization, and advanced analytical techniques.',
    icon: '📊',
    color: '#8B5CF6',
    colorRgb: '139, 92, 246',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    videoSrc: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
    duration: '15 Hours',
    difficulty: 'Intermediate',
    topics: [
      'Statistical Analysis',
      'Pandas & NumPy',
      'Data Visualization',
      'Feature Engineering',
      'Hypothesis Testing',
      'Regression Models',
      'Clustering',
      'Data Pipelines',
    ],
    position: [6, 0, -3],
    roomLabel: 'East Wing — Room 2',
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    shortTitle: 'AI / ML',
    description:
      'Explore the cutting edge of artificial intelligence and machine learning. Build neural networks, train models, and understand the algorithms powering the future.',
    icon: '🧠',
    color: '#EC4899',
    colorRgb: '236, 72, 153',
    gradient: 'linear-gradient(135deg, #DB2777 0%, #EC4899 100%)',
    videoSrc: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
    duration: '20 Hours',
    difficulty: 'Advanced',
    topics: [
      'Neural Networks',
      'Deep Learning',
      'TensorFlow & PyTorch',
      'Computer Vision',
      'NLP Fundamentals',
      'Model Optimization',
      'Transfer Learning',
      'Generative AI',
    ],
    position: [0, 0, -6],
    roomLabel: 'Central Hall — Core Room',
  },
  {
    id: 'docker',
    title: 'Docker & Containerization',
    shortTitle: 'Docker',
    description:
      'Master container technology with Docker. Learn to build, ship, and run applications in isolated environments for consistent deployment across any platform.',
    icon: '🐳',
    color: '#06B6D4',
    colorRgb: '6, 182, 212',
    gradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
    videoSrc: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    duration: '8 Hours',
    difficulty: 'Intermediate',
    topics: [
      'Container Basics',
      'Dockerfile Mastery',
      'Docker Compose',
      'Networking',
      'Volume Management',
      'Multi-stage Builds',
      'Docker Swarm',
      'Security Best Practices',
    ],
    position: [-6, 0, 3],
    roomLabel: 'West Wing — Room 3',
  },
  {
    id: 'mlops',
    title: 'MLOps Engineering',
    shortTitle: 'MLOps',
    description:
      'Bridge the gap between ML models and production systems. Learn to deploy, monitor, and maintain machine learning models at scale with industry-standard MLOps practices.',
    icon: '⚙️',
    color: '#F59E0B',
    colorRgb: '245, 158, 11',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    videoSrc: 'https://www.youtube.com/watch?v=9lQhZrKpQh8',
    duration: '14 Hours',
    difficulty: 'Advanced',
    topics: [
      'ML Pipeline Design',
      'Model Versioning',
      'CI/CD for ML',
      'Model Monitoring',
      'Feature Stores',
      'A/B Testing',
      'Kubeflow',
      'MLflow & DVC',
    ],
    position: [6, 0, 3],
    roomLabel: 'East Wing — Room 4',
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud Infrastructure',
    shortTitle: 'DevOps',
    description:
      'Master the DevOps lifecycle. Automate infrastructure, build CI/CD pipelines, and deploy applications with modern cloud-native tools and practices.',
    icon: '☁️',
    color: '#10B981',
    colorRgb: '16, 185, 129',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    videoSrc: 'https://www.youtube.com/watch?v=j5Zsa_eOXeY',
    duration: '16 Hours',
    difficulty: 'Intermediate',
    topics: [
      'CI/CD Pipelines',
      'Infrastructure as Code',
      'Kubernetes',
      'Terraform',
      'AWS / GCP / Azure',
      'Monitoring & Logging',
      'GitOps',
      'Site Reliability',
    ],
    position: [-3, 0, 6],
    roomLabel: 'South Hall — Room 5',
  },
  {
    id: 'ethical-hacking',
    title: 'Ethical Hacking & Cybersecurity',
    shortTitle: 'Ethical Hacking',
    description:
      'Learn offensive and defensive security techniques. Discover vulnerabilities, perform penetration testing, and protect systems from real-world cyber threats.',
    icon: '🛡️',
    color: '#EF4444',
    colorRgb: '239, 68, 68',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    videoSrc: 'https://www.youtube.com/watch?v=fNzpcB9Ow2k',
    duration: '18 Hours',
    difficulty: 'Advanced',
    topics: [
      'Penetration Testing',
      'Network Scanning',
      'Vulnerability Assessment',
      'Web App Security',
      'Social Engineering',
      'Cryptography',
      'Incident Response',
      'Security Auditing',
    ],
    position: [3, 0, 6],
    roomLabel: 'South Hall — Room 6',
  },
  {
    id: 'networking',
    title: 'Advanced Networking',
    shortTitle: 'Networking',
    description:
      'Deep dive into modern networking architectures. Master protocols, routing, switching, and build enterprise-grade network infrastructures from the ground up.',
    icon: '🌐',
    color: '#6366F1',
    colorRgb: '99, 102, 241',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
    videoSrc: 'https://www.youtube.com/watch?v=qiQR5rTSshw',
    duration: '10 Hours',
    difficulty: 'Intermediate',
    topics: [
      'TCP/IP Deep Dive',
      'Routing Protocols',
      'Switching & VLANs',
      'Network Security',
      'Wireless Networking',
      'SDN Concepts',
      'Cloud Networking',
      'Network Automation',
    ],
    position: [0, 0, 8],
    roomLabel: 'South Hall — Room 7',
  },
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getCoursesByDifficulty(difficulty: Course['difficulty']): Course[] {
  return COURSES.filter((c) => c.difficulty === difficulty);
}
