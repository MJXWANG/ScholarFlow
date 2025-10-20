export interface DocumentTemplate {
  id: string
  name: string
  description: string
  category: 'academic' | 'thesis' | 'report' | 'presentation' | 'letter'
  content: string
  preview?: string
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'research-paper',
    name: '学术论文',
    description: '标准学术论文模板，包含摘要、引言、方法、结果、讨论等章节',
    category: 'academic',
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{cite}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{Your Research Title}
\\author{Your Name \\and Co-author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This is where you write your abstract. The abstract should provide a brief summary of your research, including the main objectives, methods, results, and conclusions.
\\end{abstract}

\\section{Introduction}
Your introduction goes here. This section should provide background information, state the research problem, and outline the objectives of your study.

\\section{Literature Review}
Review relevant literature and establish the theoretical framework for your research.

\\section{Methodology}
Describe your research methods, data collection procedures, and analysis techniques.

\\section{Results}
Present your findings clearly and objectively. Use tables and figures as needed.

\\section{Discussion}
Interpret your results, discuss their implications, and relate them to existing literature.

\\section{Conclusion}
Summarize your main findings and suggest directions for future research.

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`
  },
  {
    id: 'thesis',
    name: '学位论文',
    description: '硕士/博士学位论文模板，包含完整的论文结构',
    category: 'thesis',
    content: `\\documentclass[12pt]{report}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{cite}
\\usepackage{geometry}
\\geometry{a4paper, margin=1.5in}

\\title{Your Thesis Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\tableofcontents
\\listoffigures
\\listoftables

\\chapter{Introduction}
Your introduction chapter goes here.

\\chapter{Literature Review}
Comprehensive review of relevant literature.

\\chapter{Methodology}
Detailed description of your research methodology.

\\chapter{Results}
Presentation of your research results.

\\chapter{Discussion}
Discussion of your findings and their implications.

\\chapter{Conclusion}
Summary and conclusions of your research.

\\bibliographystyle{plain}
\\bibliography{references}

\\appendix
\\chapter{Appendix A}
Additional materials can be included here.

\\end{document}`
  },
  {
    id: 'lab-report',
    name: '实验报告',
    description: '科学实验报告模板，适合物理、化学、生物等实验',
    category: 'report',
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{Lab Report: [Experiment Name]}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Objective}
State the purpose and objectives of the experiment.

\\section{Theory}
Describe the theoretical background and relevant equations.

\\section{Apparatus}
List all equipment and materials used in the experiment.

\\section{Procedure}
Describe the experimental procedure step by step.

\\section{Data and Results}
Present your experimental data, calculations, and results.

\\section{Analysis}
Analyze your results and discuss any sources of error.

\\section{Conclusion}
Summarize your findings and conclusions.

\\end{document}`
  },
  {
    id: 'business-report',
    name: '商业报告',
    description: '企业商业报告模板，适合项目报告、市场分析等',
    category: 'report',
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{Business Report: [Report Title]}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Executive Summary}
Provide a brief overview of the report's main findings and recommendations.

\\section{Introduction}
Introduce the topic and provide context for the report.

\\section{Methodology}
Describe the methods used to gather and analyze information.

\\section{Findings}
Present your main findings with supporting data and analysis.

\\section{Analysis}
Analyze the implications of your findings.

\\section{Recommendations}
Provide specific recommendations based on your analysis.

\\section{Conclusion}
Summarize the key points and conclusions.

\\end{document}`
  },
  {
    id: 'cover-letter',
    name: '求职信',
    description: '专业求职信模板，适合学术和商业职位申请',
    category: 'letter',
    content: `\\documentclass[12pt]{letter}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\begin{document}

\\begin{letter}{[Recipient Name] \\\\ [Company/Institution] \\\\ [Address]}

\\opening{Dear [Recipient Name],}

I am writing to express my interest in the [Position Title] position at [Company/Institution]. With my background in [Your Field] and experience in [Relevant Experience], I am confident that I would be a valuable addition to your team.

In my current role as [Current Position] at [Current Company], I have [Describe relevant achievements and responsibilities]. These experiences have equipped me with the skills necessary to excel in the [Position Title] role.

I am particularly drawn to [Company/Institution] because of [Specific reason related to the company/institution]. I am excited about the opportunity to contribute to [Specific project or goal].

I have attached my resume and would welcome the opportunity to discuss how my qualifications align with your needs. Thank you for your consideration.

\\closing{Sincerely,}
\\signature{[Your Name]}

\\end{letter}

\\end{document}`
  },
  {
    id: 'presentation-slides',
    name: '演示文稿',
    description: '学术演示文稿模板，适合会议报告和课堂展示',
    category: 'presentation',
    content: `\\documentclass{beamer}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}

\\usetheme{Madrid}
\\usecolortheme{default}

\\title[Short Title]{Your Presentation Title}
\\author{Your Name}
\\institute{Your Institution}
\\date{\\today}

\\begin{document}

\\frame{\\titlepage}

\\begin{frame}
\\frametitle{Outline}
\\tableofcontents
\\end{frame}

\\section{Introduction}
\\begin{frame}
\\frametitle{Introduction}
\\begin{itemize}
\\item Background information
\\item Problem statement
\\item Objectives
\\end{itemize}
\\end{frame}

\\section{Methodology}
\\begin{frame}
\\frametitle{Methodology}
Describe your research methods here.
\\end{frame}

\\section{Results}
\\begin{frame}
\\frametitle{Results}
Present your findings here.
\\end{frame}

\\section{Conclusion}
\\begin{frame}
\\frametitle{Conclusion}
\\begin{itemize}
\\item Summary of findings
\\item Implications
\\item Future work
\\end{itemize}
\\end{frame}

\\begin{frame}
\\frametitle{Questions?}
\\begin{center}
\\Large Thank you for your attention!
\\end{center}
\\end{frame}

\\end{document}`
  },
  {
    id: 'math-paper',
    name: '数学论文',
    description: '数学学术论文模板，包含定理、证明、公式等数学元素',
    category: 'academic',
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{amsthm}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}{Lemma}
\\newtheorem{proposition}{Proposition}
\\newtheorem{corollary}{Corollary}
\\newtheorem{definition}{Definition}
\\newtheorem{example}{Example}

\\title{Your Mathematical Paper Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This paper presents mathematical results and proofs. The abstract should summarize the main mathematical contributions and key findings.
\\end{abstract}

\\section{Introduction}
Introduce the mathematical problem and provide necessary background.

\\section{Preliminaries}
\\begin{definition}
Define important mathematical concepts here.
\\end{definition}

\\begin{lemma}
State and prove lemmas that support your main results.
\\end{lemma}

\\begin{proof}
Provide detailed proofs of your lemmas and theorems.
\\end{proof}

\\section{Main Results}
\\begin{theorem}
State your main mathematical results here.
\\end{theorem}

\\begin{proof}
Provide the proof of your main theorem.
\\end{proof}

\\section{Applications}
Show applications of your mathematical results.

\\section{Conclusion}
Summarize your mathematical contributions and suggest future directions.

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`
  },
  {
    id: 'engineering-report',
    name: '工程报告',
    description: '工程技术报告模板，适合工程项目和技术文档',
    category: 'report',
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{Engineering Report: [Project Name]}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Executive Summary}
Provide a brief overview of the engineering project, its objectives, and key findings.

\\section{Project Overview}
Describe the engineering project, its scope, and objectives.

\\section{Technical Specifications}
Detail the technical requirements and specifications.

\\section{Design and Implementation}
Describe the design process and implementation details.

\\section{Testing and Validation}
Present testing procedures and validation results.

\\section{Results and Analysis}
Analyze the project results and their implications.

\\section{Risk Assessment}
Identify potential risks and mitigation strategies.

\\section{Recommendations}
Provide recommendations for future work and improvements.

\\section{Conclusion}
Summarize the project outcomes and lessons learned.

\\end{document}`
  },
  {
    id: 'research-proposal',
    name: '研究提案',
    description: '学术研究提案模板，适合申请研究基金和项目',
    category: 'academic',
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{Research Proposal: [Research Title]}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Abstract}
Provide a concise summary of your research proposal.

\\section{Introduction}
Introduce the research topic and its significance.

\\section{Literature Review}
Review relevant literature and identify research gaps.

\\section{Research Questions and Objectives}
Clearly state your research questions and objectives.

\\section{Methodology}
Describe your research methodology and approach.

\\section{Expected Outcomes}
Outline the expected research outcomes and contributions.

\\section{Timeline}
Provide a detailed timeline for your research project.

\\section{Budget}
Estimate the required budget and resources.

\\section{References}
List relevant references and citations.

\\end{document}`
  },
  {
    id: 'technical-manual',
    name: '技术手册',
    description: '技术文档模板，适合软件文档和操作手册',
    category: 'report',
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{listings}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\lstset{
  basicstyle=\\ttfamily,
  breaklines=true,
  frame=single
}

\\title{Technical Manual: [Product/System Name]}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\tableofcontents

\\section{Introduction}
Introduce the product or system and its purpose.

\\section{Installation}
Provide installation instructions and requirements.

\\section{Configuration}
Describe configuration options and settings.

\\section{User Guide}
Provide step-by-step user instructions.

\\section{API Reference}
Document APIs and technical interfaces.

\\section{Troubleshooting}
Common issues and their solutions.

\\section{Maintenance}
Maintenance procedures and schedules.

\\section{Support}
Contact information and support resources.

\\end{document}`
  }
]

export const getTemplatesByCategory = (category: DocumentTemplate['category']): DocumentTemplate[] => {
  return documentTemplates.filter(template => template.category === category)
}

export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return documentTemplates.find(template => template.id === id)
}
