const CATEGORIES = [
  { key: "python", label: "Python Programming", emoji: "\ud83d\udc0d", tag: "Foundation", blurb: "Clean, idiomatic, production-level Python", hue: 200, topics: [
    {"key": "grp_py_fund", "label": "Fundamentals", "children": [
      {"key": "grp_py_basics", "label": "Python Basics", "children": [
        {"key": "py_fundamentals", "label": "The Map: Python Basics"},
        {"key": "py_values",       "label": "Values, Types & Variables"},
        {"key": "py_control",      "label": "Decisions & Loops"},
        {"key": "py_functions",    "label": "Functions"}
      ]},
      {"key": "grp_py_ds", "label": "Collections", "children": [
        {"key": "py_ds",           "label": "The Map: Python Collections"},
        {"key": "py_lists_tuples", "label": "Lists & Tuples"},
        {"key": "py_dicts_sets",   "label": "Dicts & Sets"},
        {"key": "py_strings",      "label": "Strings"}
      ]},
      {"key": "py_io",           "label": "Exceptions, Files & Packages"}
    ]},
    {"key": "grp_py_adv", "label": "Advanced Python", "children": [
      {"key": "grp_py_oop", "label": "Object-Oriented Python", "children": [
        {"key": "py_oop",         "label": "The Map: Object-Oriented Python"},
        {"key": "py_classes",     "label": "Classes & Objects"},
        {"key": "py_inheritance", "label": "Inheritance, Polymorphism & Design"},
        {"key": "py_dunder",      "label": "Dunder Methods & the Data Model"}
      ]},
      {"key": "grp_py_func", "label": "Iterators, Decorators & Context Managers", "children": [
        {"key": "py_advanced",    "label": "The Map: Advanced Functions"},
        {"key": "py_iterators",   "label": "Iterators & Generators"},
        {"key": "py_decorators",  "label": "Closures & Decorators"},
        {"key": "py_context",     "label": "Context Managers"}
      ]},
      {"key": "grp_py_conc", "label": "Concurrency", "children": [
        {"key": "py_concurrency",     "label": "The Map: Concurrency in Python"},
        {"key": "py_threading",       "label": "Threads & the GIL"},
        {"key": "py_multiprocessing", "label": "Processes: multiprocessing"},
        {"key": "py_asyncio",         "label": "asyncio"}
      ]},
      {"key": "py_testing",     "label": "Testing & Debugging"}
    ]}
  ] },
  { key: "softeng", label: "Software Engineering", emoji: "\u2699\ufe0f", tag: "Foundation", blurb: "Git \u00b7 Linux \u00b7 Docker", hue: 28, topics: [
    {"key": "se_git", "label": "Git & GitHub"},
    {"key": "se_linux", "label": "Linux & Terminal"},
    {"key": "se_docker", "label": "Docker"}
  ] },
  { key: "dataanalysis", label: "Data Analysis Stack", emoji: "\ud83d\udcca", tag: "Core", blurb: "NumPy \u00b7 Pandas \u00b7 Matplotlib \u00b7 Plotly", hue: 160, topics: [
    {"key": "da_numpy", "label": "NumPy"},
    {"key": "da_pandas", "label": "Pandas"},
    {"key": "da_viz", "label": "Matplotlib & Seaborn"},
    {"key": "da_plotly_streamlit", "label": "Plotly & Streamlit"}
  ] },
  { key: "apis", label: "APIs & Backend", emoji: "\ud83c\udf10", tag: "Core", blurb: "HTTP \u00b7 Auth \u00b7 Flask \u00b7 FastAPI", hue: 190, topics: [
    {"key": "api_fundamentals", "label": "HTTP & REST Fundamentals"},
    {"key": "api_auth", "label": "Authentication & Security"},
    {"key": "api_flask", "label": "Flask"},
    {"key": "api_fastapi", "label": "FastAPI"},
    {"key": "api_production", "label": "Production Backend"}
  ] },
  { key: "databases", label: "Databases", emoji: "\ud83d\uddc4\ufe0f", tag: "Core", blurb: "SQL in depth \u00b7 Window functions \u00b7 MongoDB", hue: 265, topics: [
    {"key": "db_intro", "label": "What is a Database"},
    {"key": "db_types", "label": "Types of Databases"},
    {"key": "grp_sql", "label": "SQL", "children": [
      {"key": "sql_relational",   "label": "Relational Model & PostgreSQL"},
      {"key": "sql_fundamentals", "label": "Querying Basics"},
      {"key": "sql_joins",        "label": "JOINs"},
      {"key": "sql_subqueries",   "label": "Subqueries, CTEs & Views"},
      {"key": "sql_windows",      "label": "Window Functions"},
      {"key": "sql_optimization", "label": "Indexes & Performance"},
      {"key": "sql_transactions", "label": "Transactions & Concurrency"},
      {"key": "sql_modeling",     "label": "Data Modeling"},
      {"key": "sql_interview",    "label": "Practice Q&A"}
    ]},
    {"key": "grp_mongo", "label": "MongoDB", "children": [
      {"key": "mongo_basics",      "label": "Documents & CRUD"},
      {"key": "mongo_aggregation", "label": "Aggregation Pipeline"},
      {"key": "mongo_design",      "label": "Schema Design, Indexes & Scaling"}
    ]}
  ] },
  { key: "mathstats", label: "Mathematics & Statistics", emoji: "\u03a3", tag: "Foundation", blurb: "Statistics \u00b7 Linear algebra \u00b7 Calculus", hue: 45, topics: [
    {"key": "grp_stats", "label": "Statistics", "children": [
      {"key": "st_descriptive", "label": "Descriptive Statistics"},
      {"key": "st_probability", "label": "Probability"},
      {"key": "st_distributions", "label": "Probability Distributions"},
      {"key": "st_correlation", "label": "Correlation & Relationships"},
      {"key": "st_hypothesis", "label": "Hypothesis Testing"},
      {"key": "st_abtesting", "label": "A/B Testing"}
    ]},
    {"key": "grp_math", "label": "Mathematics for ML", "children": [
      {"key": "m_linalg", "label": "Linear Algebra"},
      {"key": "m_calculus", "label": "Calculus"},
      {"key": "m_optimization", "label": "Optimization"}
    ]}
  ] },
  { key: "ml", label: "Machine Learning", emoji: "\ud83e\udd16", tag: "Core", blurb: "Regression \u00b7 Trees \u00b7 Clustering \u00b7 Evaluation", hue: 145, topics: [
    {"key": "grp_ml_found", "label": "Foundations", "children": [
      {"key": "ml_intro", "label": "What is Machine Learning"},
      {"key": "ml_splits", "label": "Train/Val/Test & Cross-Validation"},
      {"key": "ml_core", "label": "Bias, Variance & Generalization"},
      {"key": "ml_loss_gd", "label": "Loss Functions & Gradient Descent"},
      {"key": "ml_regularization", "label": "Regularization"},
      {"key": "ml_features", "label": "Feature Engineering"},
      {"key": "ml_pipelines", "label": "Pipelines & Data Leakage"}
    ]},
    {"key": "grp_ml_reg", "label": "Regression", "children": [
      {"key": "ml_regression", "label": "Linear Regression"},
      {"key": "ml_reg_diag", "label": "Assumptions & Diagnostics"},
      {"key": "ml_polyreg", "label": "Polynomial & Basis Functions"},
      {"key": "ml_ridge_lasso", "label": "Ridge, Lasso & Elastic Net"}
    ]},
    {"key": "grp_ml_cls", "label": "Classification", "children": [
      {"key": "ml_classification", "label": "Logistic Regression"},
      {"key": "ml_naivebayes", "label": "Naive Bayes"},
      {"key": "ml_knn", "label": "K-Nearest Neighbors"},
      {"key": "ml_svm", "label": "Support Vector Machines"}
    ]},
    {"key": "grp_ml_trees", "label": "Tree-Based Models", "children": [
      {"key": "ml_trees",          "label": "The Tree Family: Map & How to Choose"},
      {"key": "ml_dtree",          "label": "Decision Trees"},
      {"key": "grp_ml_ens", "label": "Ensemble Methods", "children": [
        {"key": "ml_ensembles",    "label": "Ensemble Learning: The Idea"},
        {"key": "grp_ml_bag", "label": "Bagging", "children": [
          {"key": "ml_bagging",    "label": "Bagging & Bootstrap"},
          {"key": "ml_rf",         "label": "Random Forest"},
          {"key": "ml_extratrees", "label": "Extra Trees"}
        ]},
        {"key": "grp_ml_boost", "label": "Boosting", "children": [
          {"key": "ml_boosting",   "label": "How Boosting Works"},
          {"key": "ml_adaboost",   "label": "AdaBoost"},
          {"key": "ml_gbm",        "label": "Gradient Boosting"},
          {"key": "ml_xgboost",    "label": "XGBoost"},
          {"key": "ml_lightgbm",   "label": "LightGBM"},
          {"key": "ml_catboost",   "label": "CatBoost"}
        ]},
        {"key": "ml_stacking",     "label": "Stacking & Voting"}
      ]},
      {"key": "ml_tree_explain",   "label": "Feature Importance & SHAP"},
      {"key": "ml_tree_tuning",    "label": "Tuning & Production"}
    ]},
    {"key": "grp_ml_eval", "label": "Model Evaluation", "children": [
      {"key": "ml_evaluation", "label": "Classification Metrics"},
      {"key": "ml_reg_metrics", "label": "Regression Metrics"},
      {"key": "ml_calibration", "label": "Thresholds & Calibration"}
    ]},
    {"key": "grp_ml_clu", "label": "Clustering", "children": [
      {"key": "ml_clustering", "label": "Clustering: The Idea & Distances"},
      {"key": "ml_kmeans", "label": "K-Means"},
      {"key": "ml_hierarchical", "label": "Hierarchical Clustering"},
      {"key": "ml_dbscan", "label": "DBSCAN & HDBSCAN"},
      {"key": "ml_gmm", "label": "Gaussian Mixture Models"},
      {"key": "ml_cluster_eval", "label": "Evaluating Clusters"}
    ]},
    {"key": "grp_ml_dr", "label": "Dimensionality Reduction", "children": [
      {"key": "ml_dimred", "label": "Curse of Dimensionality & Feature Selection"},
      {"key": "ml_pca", "label": "PCA"},
      {"key": "ml_tsne", "label": "t-SNE"},
      {"key": "ml_umap", "label": "UMAP"}
    ]},
    {"key": "grp_ml_ts", "label": "Time Series", "children": [
      {"key": "ml_timeseries", "label": "Time Series Basics"},
      {"key": "ml_arima", "label": "ARIMA Family"},
      {"key": "ml_ets_prophet", "label": "Exponential Smoothing & Prophet"},
      {"key": "ml_ts_ml", "label": "ML Forecasting"}
    ]},
    {"key": "grp_ml_rs", "label": "Recommendation Systems", "children": [
      {"key": "ml_recsys", "label": "Recommender Basics & Content-Based"},
      {"key": "ml_cf", "label": "Collaborative Filtering"},
      {"key": "ml_mf", "label": "Matrix Factorization"},
      {"key": "ml_rs_ranking", "label": "Ranking, Evaluation & Cold Start"}
    ]}
  ] },
  { key: "dl", label: "Deep Learning", emoji: "\ud83e\udde0", tag: "Core", blurb: "PyTorch \u00b7 CNNs \u00b7 RNNs \u00b7 Attention", hue: 325, topics: [
    {"key": "dl_foundations", "label": "NN Foundations"},
    {"key": "dl_pytorch",     "label": "PyTorch"},
    {"key": "dl_keras",       "label": "TensorFlow & Keras"},
    {"key": "dl_cnns",        "label": "CNNs"},
    {"key": "dl_rnns",        "label": "RNNs & Sequential"},
    {"key": "dl_attention",   "label": "Attention Mechanisms"}
  ] },
  { key: "mlops", label: "MLOps & Deployment", emoji: "\ud83d\ude80", tag: "Production", blurb: "MLflow \u00b7 Docker \u00b7 Kubernetes \u00b7 CI/CD", hue: 12, topics: [
    {"key": "mlops_lifecycle", "label": "The ML Lifecycle"},
    {"key": "mlops_mlflow", "label": "MLflow & Experiment Tracking"},
    {"key": "mlops_deploy", "label": "Deployment Strategies"}
  ] },
  { key: "dataeng", label: "Data Engineering", emoji: "\ud83d\udd27", tag: "Production", blurb: "ETL \u00b7 Spark \u00b7 Kafka", hue: 350, topics: [
    {"key": "de_etl", "label": "ETL & Orchestration"},
    {"key": "de_spark", "label": "Apache Spark"},
    {"key": "de_kafka", "label": "Kafka & Streaming"}
  ] },
  { key: "systemdesign", label: "ML System Design", emoji: "\ud83c\udfd7\ufe0f", tag: "Senior", blurb: "Serving \u00b7 Monitoring \u00b7 Experiments \u00b7 Cases", hue: 230, topics: [
    {"key": "sd_framework", "label": "How to Approach ML System Design"},
    {"key": "sd_serving", "label": "Feature Stores & Online/Offline Serving"},
    {"key": "sd_monitoring", "label": "Monitoring, Drift & Retraining"},
    {"key": "sd_experiments", "label": "Shadow, Canary & A/B Infrastructure"},
    {"key": "sd_cases", "label": "Case Studies"}
  ] },
  { key: "genai", label: "Generative AI", emoji: "\u2728", tag: "Advanced", blurb: "Transformers \u00b7 RAG \u00b7 LangGraph \u00b7 Agents", hue: 290, topics: [
    {"key": "genai_roadmap", "label": "Start Here: The Learning Path"},
    {"key": "grp_genai_found", "label": "Foundations", "children": [
      {"key": "nlp",          "label": "NLP Foundations"},
      {"key": "transformers", "label": "Transformers"},
      {"key": "llm_basics",   "label": "How LLMs Work"}
    ]},
    {"key": "grp_genai_use", "label": "Working with LLMs", "children": [
      {"key": "prompting", "label": "Prompt Engineering"},
      {"key": "llm_apis",  "label": "LLM APIs & Tool Calling"}
    ]},
    {"key": "grp_genai_rag", "label": "RAG", "children": [
      {"key": "vectordb", "label": "Embeddings & Vector DBs"},
      {"key": "rag",      "label": "Retrieval-Augmented Generation"}
    ]},
    {"key": "grp_genai_agents", "label": "Agents", "children": [
      {"key": "agentic",     "label": "Agent Fundamentals"},
      {"key": "agent_build", "label": "Build an Agent from Scratch"},
      {"key": "langchain",   "label": "LangChain"},
      {"key": "langgraph",   "label": "LangGraph"},
      {"key": "multiagent",  "label": "Multi-Agent Systems & MCP"}
    ]},
    {"key": "grp_genai_prod", "label": "Production", "children": [
      {"key": "llm_evals", "label": "Evaluation & Observability"},
      {"key": "llm_prod",  "label": "Guardrails, Cost & Deployment"}
    ]},
    {"key": "grp_genai_ft", "label": "Customizing Models", "children": [
      {"key": "finetuning", "label": "Fine-Tuning"}
    ]},
    {"key": "agent_capstone", "label": "Capstone: Ship an Agent"}
  ] },
  { key: "dsa", label: "Data Structures & Algos", emoji: "\ud83c\udf33", tag: "Interview", blurb: "Patterns from arrays to DP, with solved problems", hue: 100, topics: [
    {"key": "dsa_problems", "label": "Problem Tracker"},
    {"key": "grp_dsa_found", "label": "Foundations", "children": [
      {"key": "dsa_complexity", "label": "Complexity & Python Internals"},
      {"key": "dsa_arrays",     "label": "Arrays, Strings & Two Pointers"},
      {"key": "dsa_hashing",    "label": "Hashing"},
      {"key": "dsa_sorting",    "label": "Sorting"},
      {"key": "dsa_binsearch",  "label": "Binary Search"}
    ]},
    {"key": "grp_dsa_linear", "label": "Linear Structures", "children": [
      {"key": "dsa_linkedlist", "label": "Linked Lists"},
      {"key": "dsa_stacks",     "label": "Stacks & Queues"}
    ]},
    {"key": "grp_dsa_nonlinear", "label": "Trees & Graphs", "children": [
      {"key": "dsa_trees",  "label": "Trees"},
      {"key": "dsa_heaps",  "label": "Heaps & Priority Queue"},
      {"key": "dsa_tries",  "label": "Tries"},
      {"key": "dsa_graphs", "label": "Graphs"}
    ]},
    {"key": "grp_dsa_tech", "label": "Problem-Solving Techniques", "children": [
      {"key": "dsa_backtrack", "label": "Recursion & Backtracking"},
      {"key": "dsa_greedy",    "label": "Intervals & Greedy"},
      {"key": "dsa_dp",        "label": "Dynamic Programming"},
      {"key": "dsa_bits",      "label": "Bit Manipulation"},
      {"key": "dsa_math",      "label": "Math & Number Theory"}
    ]},
    {"key": "dsa_advanced", "label": "Advanced Data Structures"}
  ] }
];

const ROADMAP_PHASES = [
  {
    num: "01",
    key: "python",
    name: "Python Programming",
    emoji: "🐍",
    density: "high",
    densityLabel: "HIGH",
    desc: "Python is your weapon. Weak Python = weak debugging, weak optimisation, weak interviews.",
    why: "Everything in ML pipelines eventually becomes objects and memory operations. Production-level Python separates engineers from data analysts.",
    topics: [
      { label: "Variables & Data Types", sub: "Mutable vs immutable, memory, type conversion" },
      { label: "Operators & Control Flow", sub: "All 7 operator types, walrus, pattern matching" },
      { label: "Functions", sub: "*args, **kwargs, lambda, scope, recursion" },
      { label: "Data Structures", sub: "list, tuple, set, dict, string — O() complexity" },
      { label: "Exception Handling", sub: "try/except, custom exceptions, logging" },
      { label: "File Handling", sub: "txt, csv, json, parquet, pickle, yaml" },
      { label: "OOP ★", sub: "Classes, 4 pillars, SOLID, magic methods, MRO" },
      { label: "Generators & Iterators", sub: "yield, lazy eval — critical for large datasets" },
      { label: "Decorators", sub: "Closures, wrappers, functools.wraps" },
      { label: "Context Managers", sub: "__enter__, __exit__, contextlib" },
      { label: "Multithreading & Async", sub: "GIL, ThreadPoolExecutor, asyncio, await" },
      { label: "Testing & Debugging", sub: "pytest, fixtures, mocking, cProfile, logging" },
    ],
    noteKeys: ["py_fundamentals","py_ds","py_oop","py_advanced","py_concurrency","py_testing"],
    questions: [
      "Mutable vs immutable — give examples and explain why it matters",
      "What is the GIL and when does it matter?",
      "How does a generator save memory compared to a list?",
      "Explain SOLID principles briefly",
    ]
  },
  {
    num: "02",
    key: "softeng",
    name: "Software Engineering",
    emoji: "⚙️",
    density: "med",
    densityLabel: "MEDIUM",
    desc: "Most DS candidates fail here. Knowing ML math but ignoring engineering fundamentals is why.",
    why: "Git, Linux, and Docker are non-negotiables. A model nobody can reproduce or deploy is worthless.",
    topics: [
      { label: "Git & Version Control", sub: "Branching, merging, rebase, pull requests, gitignore" },
      { label: "Linux & Terminal", sub: "Shell commands, permissions, bash scripting, SSH, cron" },
      { label: "Docker Basics", sub: "Dockerfile, images, containers, volumes, docker-compose" },
      { label: "Design Patterns", sub: "Factory, Strategy, Observer, Singleton, Decorator" },
      { label: "REST API Design", sub: "HTTP methods, status codes, authentication, versioning" },
    ],
    noteKeys: [],
    questions: [
      "Walk me through your Git branching strategy for an ML project",
      "Dockerfile for a Python ML service — what do you include?",
      "What is the difference between CMD and ENTRYPOINT?",
    ]
  },
  {
    num: "03",
    key: "dataanalysis",
    name: "Data Analysis Stack",
    emoji: "📊",
    density: "high",
    densityLabel: "HIGH",
    desc: "The daily toolkit of every data scientist. Master it before touching ML models.",
    why: "Every ML interview has a Pandas or NumPy problem. You will not be warned in advance.",
    topics: [
      { label: "NumPy", sub: "ndarrays, vectorisation, broadcasting, linear algebra" },
      { label: "Pandas ★", sub: "DataFrames, groupby, joins, window functions, time series" },
      { label: "Matplotlib & Seaborn", sub: "Line, scatter, heatmap, pairplot, subplots" },
      { label: "Plotly & Interactive Viz", sub: "Dashboards, animations, geographic plots" },
      { label: "Streamlit", sub: "Widgets, session state, caching, deploying ML demos" },
    ],
    noteKeys: [],
    questions: [
      "Explain broadcasting in NumPy with an example",
      "GroupBy vs pivot_table — when to use each?",
      "Memory optimisation techniques for large Pandas DataFrames",
    ]
  },
  {
    num: "04",
    key: "apis",
    name: "APIs & Backend Development",
    emoji: "🌐",
    density: "high",
    densityLabel: "HIGH",
    desc: "Modern ML engineers must expose models via APIs. A model nobody can call is a model nobody uses.",
    why: "Every ML model in production is called through an API. FastAPI is the de facto standard for ML serving.",
    topics: [
      { label: "HTTP & REST Fundamentals", sub: "Methods, status codes, headers, JSON, versioning" },
      { label: "FastAPI ★", sub: "Async APIs, Pydantic validation, dependency injection, WebSockets" },
      { label: "Flask", sub: "Routing, middleware, blueprints — good for learning fundamentals" },
      { label: "Authentication & Security", sub: "JWT, OAuth 2.0, API keys, HTTPS, rate limiting" },
      { label: "Redis & Caching", sub: "Cache strategies, pub/sub, session management" },
      { label: "Celery (Task Queues)", sub: "Async background jobs, scheduled tasks" },
    ],
    noteKeys: [],
    questions: [
      "How do you serve a PyTorch model via FastAPI? Walk through the implementation.",
      "Sync vs async in FastAPI — when does async actually help?",
      "How do you implement rate limiting on an LLM API?",
    ]
  },
  {
    num: "05",
    key: "databases",
    name: "Databases",
    emoji: "🗄️",
    density: "vhigh",
    densityLabel: "★ VERY HIGH",
    desc: "SQL is the most-tested skill after Python. Window functions appear in almost every analytics interview.",
    why: "Data storage and retrieval is the foundation. If you cannot query data efficiently you cannot build anything.",
    topics: [
      { label: "SQL Fundamentals ★", sub: "JOINs, aggregations, subqueries, DISTINCT, LIMIT" },
      { label: "Intermediate SQL ★", sub: "CTEs, window functions (ROW_NUMBER, LAG, LEAD, RANK)" },
      { label: "Advanced SQL", sub: "Query optimisation, EXPLAIN, ACID, transactions, indexes" },
      { label: "MongoDB (NoSQL)", sub: "Collections, aggregation pipeline, indexing, sharding" },
      { label: "AWS Databases", sub: "RDS (SQL), DynamoDB (NoSQL), Redshift (data warehouse)" },
    ],
    noteKeys: [],
    questions: [
      "Find the second highest salary using window functions",
      "INNER JOIN vs LEFT JOIN — give a real-world example of each",
      "When would you choose DynamoDB over PostgreSQL?",
      "What is a query execution plan and how do you use it?",
    ]
  },
  {
    num: "06",
    key: "mathstats",
    name: "Mathematics & Statistics",
    emoji: "Σ",
    density: "vhigh",
    densityLabel: "★ VERY HIGH",
    desc: "The real foundation of ML intuition. You can use sklearn without this — you cannot debug or improve models without it.",
    why: "Statistics questions appear in every DS interview. Linear algebra is the language ML is written in.",
    topics: [
      { label: "Descriptive Statistics", sub: "Mean, median, variance, skewness, percentiles, IQR" },
      { label: "Probability ★", sub: "Conditional probability, Bayes' theorem, distributions" },
      { label: "Hypothesis Testing ★", sub: "p-value, t-tests, chi-square, Type I & II errors" },
      { label: "A/B Testing ★", sub: "Experiment design, sample size, statistical significance" },
      { label: "Linear Algebra", sub: "Vectors, matrices, eigenvectors, SVD, PCA intuition" },
      { label: "Calculus for ML", sub: "Derivatives, gradients, chain rule, Jacobian" },
      { label: "Optimisation", sub: "Gradient descent variants, convex optimisation, loss landscapes" },
    ],
    noteKeys: [],
    questions: [
      "Explain p-value in plain English — what does p=0.03 mean?",
      "How would you design an A/B test for a new recommendation algorithm?",
      "What is the difference between correlation and causation?",
      "Explain SVD and how PCA uses it",
    ]
  },
  {
    num: "07",
    key: "ml",
    name: "Machine Learning",
    emoji: "🤖",
    density: "vhigh",
    densityLabel: "★ VERY HIGH",
    desc: "Understand every algorithm at three levels: intuition, math, and implementation.",
    why: "The heart of data science. Interviewers test this at depth — bias-variance, regularisation, tree-based models are asked constantly.",
    topics: [
      { label: "ML Fundamentals ★", sub: "Bias-variance tradeoff, overfitting, cross-validation, feature scaling" },
      { label: "Regression", sub: "Linear, Ridge (L2), Lasso (L1), Elastic Net, polynomial" },
      { label: "Classification", sub: "Logistic regression, KNN, SVM, Naive Bayes, decision boundaries" },
      { label: "Tree-Based Models ★★", sub: "Decision trees, Random Forest, XGBoost, LightGBM, CatBoost" },
      { label: "Clustering", sub: "KMeans, DBSCAN, hierarchical, silhouette score" },
      { label: "Dimensionality Reduction", sub: "PCA, t-SNE, UMAP — when and why" },
      { label: "Time Series ★", sub: "ARIMA, SARIMA, Prophet, feature engineering for TS" },
      { label: "Recommendation Systems", sub: "Collaborative filtering, matrix factorisation, cold start" },
      { label: "Model Evaluation ★", sub: "Confusion matrix, AUC-ROC, F1, RMSE, MAPE — when to use each" },
    ],
    noteKeys: ["ml_intro","ml_core","ml_regression","ml_classification","ml_trees","ml_clustering","ml_dimred","ml_evaluation"],
    questions: [
      "Explain the bias-variance tradeoff with a concrete example",
      "How does gradient boosting work? What makes XGBoost fast?",
      "Random Forest vs XGBoost — when do you choose each?",
      "How do you handle class imbalance?",
      "Walk me through how you would build a demand forecasting model",
    ]
  },
  {
    num: "08",
    key: "dl",
    name: "Deep Learning",
    emoji: "🧠",
    density: "vhigh",
    densityLabel: "★ VERY HIGH",
    desc: "Learning hierarchical representations. Also the foundation all of GenAI is built on.",
    why: "Cannot understand transformers, attention, or LLMs without understanding neural networks first. Interviewers test for hand-waving with deceptively simple warm-ups.",
    topics: [
      { label: "Neural Network Foundations ★", sub: "Neuron, forward pass, backprop, loss functions, gradient descent" },
      { label: "Activation Functions ★", sub: "Sigmoid, Tanh, ReLU, Leaky ReLU, GELU, Softmax — when and why" },
      { label: "Optimisation & Training ★", sub: "SGD, Adam, learning rate, gradient clipping, warmup" },
      { label: "Regularisation", sub: "Dropout, weight decay, BatchNorm, LayerNorm" },
      { label: "GPU & Parallel Training", sub: "CUDA basics, mixed precision, DDP, model parallelism" },
      { label: "PyTorch ★★", sub: "Tensors, autograd, nn.Module, DataLoader, training loops" },
      { label: "CNNs", sub: "Convolution, pooling, ResNet skip connections, transfer learning" },
      { label: "RNNs & Sequential Models", sub: "RNN, vanishing gradient, LSTM, GRU, seq2seq" },
      { label: "Attention Mechanisms ★★", sub: "Self-attention, Q/K/V, multi-head, positional encoding" },
    ],
    noteKeys: [],
    questions: [
      "Explain backpropagation using the chain rule",
      "Why does sigmoid cause vanishing gradient? How did ReLU fix it?",
      "What is the dying ReLU problem?",
      "Why do transformers use LayerNorm instead of BatchNorm?",
      "Walk through a complete forward pass through a transformer block",
    ]
  },
  {
    num: "09",
    key: "mlops",
    name: "MLOps & Deployment",
    emoji: "🚀",
    density: "high",
    densityLabel: "HIGH",
    desc: "Building a model is 10% of the work. Making it run reliably at scale is 90%.",
    why: "Asked at L5+. Latency, cost, serving infrastructure, KV cache, batching, drift detection.",
    topics: [
      { label: "ML Lifecycle & Versioning", sub: "DVC, data versioning, config management (Hydra), code quality" },
      { label: "Experiment Tracking ★", sub: "MLflow — params, metrics, artifacts, Model Registry" },
      { label: "CI/CD for ML ★", sub: "Docker, Jenkins, GitHub Actions — automated retraining pipelines" },
      { label: "Model Serving ★", sub: "FastAPI, BentoML, ONNX, Seldon Core, real-time vs batch" },
      { label: "Kubernetes for ML", sub: "Pods, Deployments, HPA, Helm, canary deployments" },
      { label: "Cloud ML Platforms", sub: "AWS SageMaker (training jobs, endpoints, registry), Vertex AI" },
      { label: "Pipeline Orchestration", sub: "Airflow DAGs, Prefect flows, end-to-end ML pipelines" },
      { label: "Monitoring & Drift ★", sub: "Evidently, Prometheus, Grafana, data drift vs concept drift" },
      { label: "GenAI MLOps", sub: "vLLM, RAG pipeline CI/CD, LLM monitoring, fine-tune pipelines" },
    ],
    noteKeys: [],
    questions: [
      "How do you detect data drift in a production model?",
      "Real-time endpoint vs batch transform — when do you choose each?",
      "Walk through your CI/CD pipeline for ML model retraining",
      "How do you cap cost on a per-user basis for an LLM API?",
    ]
  },
  {
    num: "10",
    key: "dataeng",
    name: "Data Engineering Basics",
    emoji: "🔧",
    density: "med",
    densityLabel: "MED-HIGH",
    desc: "Data scientists who understand data engineering are 10× more effective.",
    why: "When data doesn't fit in memory or needs real-time processing, these are the tools that matter.",
    topics: [
      { label: "ETL Pipelines", sub: "Extract, transform, load — Airflow, idempotency, error handling" },
      { label: "Apache Spark ★", sub: "Driver/executors, DataFrames, lazy evaluation, Spark SQL, PySpark" },
      { label: "Kafka Basics", sub: "Producers, consumers, topics, partitions, streaming pipelines" },
      { label: "Data Warehousing", sub: "Redshift, BigQuery, OLAP vs OLTP, star schema, partitioning" },
      { label: "AWS Data Services", sub: "Glue (ETL), Athena (SQL on S3), S3 (storage), data lake patterns" },
    ],
    noteKeys: [],
    questions: [
      "What is lazy evaluation in Spark and why does it matter?",
      "How do you handle exactly-once processing in Kafka?",
      "OLAP vs OLTP — concrete examples of each",
    ]
  },
  {
    num: "11",
    key: "systemdesign",
    name: "ML System Design",
    emoji: "🏗️",
    density: "vhigh",
    densityLabel: "★ VERY HIGH",
    desc: "What senior ML interviews actually test. Architecture, tradeoffs, scalability — all of it.",
    why: "The difference between someone who knows ML and someone companies pay heavily for.",
    topics: [
      { label: "Recommendation System Design ★", sub: "Candidate generation, ranking, feature stores, A/B testing" },
      { label: "Forecasting System Design ★", sub: "Real-time vs batch, retraining triggers, drift monitoring" },
      { label: "Feature Stores", sub: "Online vs offline, point-in-time joins, Feast, Tecton" },
      { label: "Online vs Offline Serving", sub: "Latency budgets, caching, shadow mode deployment" },
      { label: "Drift Detection Architecture", sub: "Data drift, concept drift, model drift — detection and response" },
      { label: "RAG System Design ★★", sub: "Chunking, embedding, retrieval, reranking, generation, evaluation" },
      { label: "LLM Serving Architecture ★", sub: "KV cache, batching, tensor parallelism, speculative decoding" },
      { label: "Multi-Agent System Design", sub: "Orchestration, state management, error recovery, cost control" },
    ],
    noteKeys: [],
    questions: [
      "Design a recommendation system for 100M users",
      "Design a RAG system for an internal company knowledge base",
      "How do you scale an LLM API to handle 10K requests/second?",
      "Walk me through your most recent project — why did you make each architectural choice?",
    ]
  },
  {
    num: "12",
    key: "genai",
    name: "Generative AI",
    emoji: "✨",
    density: "vhigh",
    densityLabel: "★ VERY HIGH",
    desc: "The single most-tested topic block in modern AI interviews. Spend 60% of your prep time here.",
    why: "Transformers, LLMs, RAG, agents — these appear in basically every MAANG GenAI loop.",
    topics: [
      { label: "Transformers & Attention ★★★", sub: "Q/K/V math, multi-head, encoder vs decoder, positional encoding" },
      { label: "NLP Foundations", sub: "BPE tokenisation, embeddings, Word2Vec, contextual representations" },
      { label: "Large Language Models ★★", sub: "BERT vs GPT, decoding strategies, hallucinations, RLHF" },
      { label: "Vector Databases ★★", sub: "HNSW, IVF-PQ, Chroma, Pinecone, Qdrant, Weaviate, pgvector" },
      { label: "RAG ★★★", sub: "Chunking, hybrid search, reranking, RAGAS evaluation, failure modes" },
      { label: "Prompt Engineering", sub: "Zero-shot, few-shot, CoT, self-consistency, prompt injection" },
      { label: "Fine-Tuning & Adaptation ★★", sub: "SFT, LoRA, QLoRA, quantisation (INT4/INT8, GPTQ, AWQ)" },
      { label: "LangChain ★", sub: "LCEL, memory, retrievers, agents, callbacks, LangSmith" },
      { label: "LangGraph", sub: "State machines, conditional edges, checkpointing, human-in-the-loop" },
      { label: "Agentic AI ★", sub: "ReAct, tool use, planning, memory, production failure modes" },
      { label: "LLMOps & Evaluation ★", sub: "vLLM, KV cache, RAGAS, hallucination detection, monitoring" },
    ],
    noteKeys: ["transformers","nlp","vectordb","langchain","langgraph","agentic","rag","finetuning"],
    questions: [
      "Derive scaled dot-product attention. Why the √d_k?",
      "BERT vs GPT — architecture, training objective, when to use each",
      "Walk through a complete RAG pipeline with all tradeoffs",
      "Explain LoRA in 3 sentences",
      "When do you fine-tune vs RAG vs better prompts?",
      "Design a RAG system for customer support tickets",
    ]
  },
  {
    num: "13",
    key: "dsa",
    name: "Data Structures & Algorithms",
    emoji: "🌳",
    density: "vhigh",
    densityLabel: "★ VERY HIGH",
    desc: "265 problems across 17 phases. Coding rounds are pass/fail — no partial credit.",
    why: "DSA rounds are how MAANG filters. Cannot get to the ML interview if you fail the coding screen.",
    topics: [
      { label: "Complexity & Python Internals ★", sub: "Big O, space complexity, amortised, Python built-ins" },
      { label: "Arrays & Strings ★★", sub: "Two pointers, sliding window, prefix sums, Kadane's algorithm" },
      { label: "Hashing ★", sub: "Two-sum pattern, group anagrams, subarray + hashing" },
      { label: "Linked Lists", sub: "Fast/slow pointers, reversal, merge sorted lists, LRU cache" },
      { label: "Stacks & Queues", sub: "Monotonic stack, sliding window max, stack-based evaluation" },
      { label: "Binary Search ★", sub: "Bisect, search on answer, rotated arrays, 2D binary search" },
      { label: "Trees ★", sub: "DFS/BFS traversals, BST, LCA, construct from traversal" },
      { label: "Heaps & Priority Queues", sub: "Top-K pattern, median from stream, merge K sorted lists" },
      { label: "Graphs ★★", sub: "BFS/DFS, cycle detection, topological sort, Dijkstra, Union-Find" },
      { label: "Backtracking ★", sub: "Subsets, permutations, combination sum, N-queens" },
      { label: "Dynamic Programming ★★", sub: "1D/2D DP, knapsack, interval DP, bitmask DP, stock trading" },
      { label: "Tries", sub: "Prefix search, word search II, replace words" },
      { label: "Bit Manipulation", sub: "XOR tricks, set/check/clear bit, bitmask subsets" },
    ],
    noteKeys: ["dsa_complexity","dsa_arrays","dsa_hashing","dsa_linkedlist","dsa_stacks","dsa_binsearch","dsa_trees","dsa_heaps","dsa_graphs","dsa_backtrack","dsa_dp","dsa_tries","dsa_bits","dsa_advanced","dsa_sorting","dsa_greedy","dsa_math"],
    questions: [
      "Time and space complexity of your solution — always",
      "Two Sum — what if the array is sorted? What if unsorted?",
      "Explain the sliding window technique with an example",
      "When do you use BFS vs DFS?",
      "How does dynamic programming differ from recursion with memoisation?",
    ]
  },
];



const SYLLABUS = [{"num": "01", "name": "Python Programming", "icon": "\ud83d\udc0d", "tag": "Foundation", "desc": "Clean, scalable, production-level code", "topics": [{"name": "Variables & Data Types", "note": "py_values", "sub": ["variables", "memory references", "immutable vs mutable", "integers", "floats", "booleans", "strings", "bytes", "type conversion"]}, {"name": "Operators", "note": "py_values", "sub": ["arithmetic", "logical", "comparison", "assignment", "membership", "identity", "bitwise operators"]}, {"name": "Control Flow", "note": "py_control", "sub": ["if / else", "nested conditions", "loops", "break / continue", "loop else", "pattern matching"]}, {"name": "Functions", "note": "py_functions", "sub": ["function creation", "parameters", "return values", "keyword arguments", "default arguments", "*args / **kwargs", "recursion", "lambda functions", "scope resolution"]}, {"name": "Data Structures", "note": "py_ds", "sub": ["lists \u2014 slicing, comprehensions, copying", "shallow vs deep copy", "tuples \u2014 immutable ordered", "sets \u2014 unique, fast lookup", "dictionaries \u2014 key-value, nested, comprehensions", "hashing basics", "strings \u2014 slicing, formatting, regex, encoding, unicode"]}, {"name": "Exception Handling", "note": "py_fundamentals", "sub": ["try / except / finally", "raising exceptions", "custom exceptions", "logging exceptions"]}, {"name": "File Handling", "note": "py_fundamentals", "sub": ["txt", "csv", "json", "parquet", "pickle", "yaml"]}, {"name": "Modules & Packages", "note": "py_fundamentals", "sub": ["imports", "package structure", "virtual environments", "pip", "poetry", "requirements.txt"]}, {"name": "OOP \u2605", "note": "py_oop", "sub": ["classes", "objects", "constructors (__init__)", "attributes", "methods", "static methods", "class methods", "Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "magic / dunder methods", "operator overloading", "abstract base classes (ABC)", "interfaces", "composition vs inheritance", "MRO", "SOLID principles", "design patterns basics"]}, {"name": "Iterators & Generators", "note": "py_iterators", "sub": ["iter()", "next()", "yield keyword", "generator expressions", "lazy evaluation", "custom generators"]}, {"name": "Decorators", "note": "py_decorators", "sub": ["closures", "wrapper functions", "parameterized decorators", "functools.wraps"]}, {"name": "Context Managers", "note": "py_context", "sub": ["with statement", "__enter__", "__exit__", "contextlib"]}, {"name": "Multithreading", "note": "py_threading", "sub": ["threading module", "locks", "semaphores", "race conditions", "deadlocks", "thread pools"]}, {"name": "Multiprocessing", "note": "py_multiprocessing", "sub": ["process pools", "queues", "pipes", "shared memory", "IPC"]}, {"name": "Asyncio", "note": "py_asyncio", "sub": ["event loop", "coroutines", "async / await", "tasks", "asyncio.gather", "async HTTP requests"]}, {"name": "Testing & Debugging", "note": "py_testing", "sub": ["pytest", "unit testing", "mocking", "profiling", "debugging (pdb)", "logging module"]}]}, {"num": "02", "name": "Software Engineering", "icon": "\u2699\ufe0f", "tag": "Foundation", "desc": "Git \u00b7 Linux \u00b7 Docker", "topics": [{"name": "Git & GitHub", "note": "se_git", "sub": ["commits & commit messages", "branches", "merge vs rebase", "pull requests", "conflict resolution", "gitignore", "tagging releases"]}, {"name": "Linux & Terminal", "note": "se_linux", "sub": ["shell commands (ls, cp, mv, grep, find)", "file permissions (chmod, chown)", "environment variables", "process monitoring (ps, top, htop)", "bash scripting", "SSH", "cron jobs"]}, {"name": "Docker Basics", "note": "se_docker", "sub": ["Dockerfile", "images", "containers", "docker-compose", "volumes", "networking", "docker registry"]}]}, {"num": "03", "name": "Data Analysis Stack", "icon": "\ud83d\udcca", "tag": "Core", "desc": "NumPy \u00b7 Pandas \u00b7 Matplotlib \u00b7 Streamlit", "topics": [{"name": "NumPy", "note": "da_numpy", "sub": ["ndarrays", "vectorization", "broadcasting", "indexing & slicing", "reshaping", "stacking", "linear algebra operations", "random module", "performance vs lists"]}, {"name": "Pandas", "note": "da_pandas", "sub": ["DataFrames & Series", "filtering & querying", "groupby & aggregations", "joins & merges", "handling missing values", "pivot tables", "window functions", "time series operations", "apply & map", "memory optimization", "reading/writing CSV, Excel, Parquet"]}, {"name": "Matplotlib", "note": "da_viz", "sub": ["line plots", "scatter plots", "histograms", "bar charts", "subplots", "customization"]}, {"name": "Seaborn", "note": "da_viz", "sub": ["heatmaps", "pairplots", "distribution plots", "categorical plots", "regression plots"]}, {"name": "Plotly", "note": "da_plotly_streamlit", "sub": ["interactive charts", "dashboards", "animations", "geographic plots"]}, {"name": "Streamlit", "note": "da_plotly_streamlit", "sub": ["widgets & forms", "session state", "caching", "deployment", "building ML demos"]}]}, {"num": "04", "name": "APIs & Backend", "icon": "\ud83c\udf10", "tag": "Core", "desc": "Flask \u00b7 FastAPI \u00b7 Redis \u00b7 Celery", "topics": [{"name": "API Fundamentals", "note": "api_fundamentals", "sub": ["HTTP protocol", "REST principles", "request-response cycle", "JSON serialization", "status codes (200, 400, 404, 500)", "headers", "cookies", "API versioning"]}, {"name": "Authentication & Security", "note": "api_auth", "sub": ["JWT", "OAuth 2.0", "API keys", "session authentication", "HTTPS / TLS", "rate limiting"]}, {"name": "Flask", "note": "api_flask", "sub": ["routing", "middleware", "templates (Jinja2)", "request handling", "blueprints", "Flask-RESTful"]}, {"name": "FastAPI \u2605", "note": "api_fastapi", "sub": ["async APIs", "dependency injection", "Pydantic models & validation", "middleware", "WebSockets", "background tasks", "OpenAPI / Swagger docs", "path & query parameters", "response models", "error handling"]}, {"name": "Production Backend", "note": "api_production", "sub": ["caching strategies", "Redis", "Celery (task queues)", "rate limiting", "monitoring & alerting", "structured logging", "nginx (reverse proxy)", "gunicorn / uvicorn", "health checks", "horizontal scaling"]}]}, {"num": "05", "name": "Databases", "icon": "\ud83d\uddc4\ufe0f", "tag": "Core", "desc": "Database foundations \u00b7 SQL (deep) \u00b7 Window Functions \u00b7 Optimization \u00b7 MongoDB", "topics": [{"name": "What is a Database", "note": "db_intro", "sub": ["data vs database vs DBMS", "why not files / Excel", "inside a DBMS: parser, optimizer, pages, WAL", "schema & data shapes", "OLTP vs OLAP"]}, {"name": "Types of Databases", "note": "db_types", "sub": ["relational, document, key-value, wide-column", "graph, time-series, search, vector", "row vs column stores", "ACID vs BASE, CAP", "how to choose"]}, {"name": "Relational Model & PostgreSQL", "note": "sql_relational", "sub": ["tables, keys & relationships", "SQL sub-languages (DDL, DML, DCL, TCL)", "what PostgreSQL is & why", "data types & constraints", "querying Postgres from Python"]}, {"name": "SQL Fundamentals \u2605", "note": "sql_fundamentals", "sub": ["logical execution order", "CRUD (SELECT, INSERT, UPDATE, DELETE)", "NULL & three-valued logic", "aggregations (SUM, COUNT, AVG, MAX, MIN)", "filtering (WHERE, HAVING)", "CASE & conditional aggregation", "sorting, DISTINCT, LIMIT / OFFSET", "UPSERT & constraints"]}, {"name": "JOINs \u2605", "note": "sql_joins", "sub": ["INNER, LEFT, RIGHT, FULL, CROSS", "self joins", "semi & anti joins", "ON vs WHERE in outer joins", "fan-out & double counting", "join algorithms (nested loop, hash, merge)"]}, {"name": "Subqueries, CTEs & Views", "note": "sql_subqueries", "sub": ["scalar, derived & correlated subqueries", "EXISTS vs IN vs JOIN", "NOT IN NULL trap", "CTEs", "recursive CTEs", "LATERAL", "views & materialized views", "stored procedures"]}, {"name": "Window Functions \u2605", "note": "sql_windows", "sub": ["ROW_NUMBER, RANK, DENSE_RANK", "LAG / LEAD", "running totals & moving averages", "frames (ROWS vs RANGE)", "top-N per group", "gaps & islands", "sessionization"]}, {"name": "Indexes & Query Optimization", "note": "sql_optimization", "sub": ["B-tree, hash, GIN, BRIN", "composite & covering indexes", "sargability", "execution plans (EXPLAIN)", "query planner statistics", "partitioning", "row vs columnar stores"]}, {"name": "Transactions, Concurrency & Scaling", "note": "sql_transactions", "sub": ["ACID properties", "isolation levels & anomalies", "MVCC", "locks & deadlocks", "replication", "sharding", "SQL vs NoSQL"]}, {"name": "Data Modeling & Normalization", "note": "sql_modeling", "sub": ["keys & relationships", "normalization (1NF, 2NF, 3NF, BCNF)", "denormalization", "star vs snowflake schema", "slowly changing dimensions", "OLTP vs OLAP"]}, {"name": "SQL Practice Q&A", "note": "sql_interview", "sub": ["Nth highest salary", "top-N per group", "retention & cohorts", "funnels", "streaks", "YoY growth", "pivoting", "date spines"]}, {"name": "MongoDB: Documents & CRUD", "note": "mongo_basics", "sub": ["documents, BSON, collections", "SQL \u2194 MongoDB terms", "find, filters & projections", "update operators & upserts", "pymongo"]}, {"name": "MongoDB: Aggregation Pipeline", "note": "mongo_aggregation", "sub": ["$match, $group, $project, $sort", "$unwind & $lookup", "SQL \u2192 pipeline mapping", "pipeline performance"]}, {"name": "MongoDB: Schema Design & Scaling", "note": "mongo_design", "sub": ["embed vs reference", "design patterns", "indexes & the ESR rule", "replica sets & sharding"]}]}, {"num": "06", "name": "Mathematics & Statistics", "icon": "\u03a3", "tag": "Foundation", "desc": "Stats \u00b7 Linear Algebra \u00b7 Calculus \u00b7 Optimization", "topics": [{"name": "Descriptive Statistics", "note": "st_descriptive", "sub": ["mean, median, mode", "variance & standard deviation", "skewness", "kurtosis", "percentiles & IQR", "data distributions"]}, {"name": "Probability", "note": "st_probability", "sub": ["conditional probability", "Bayes' theorem", "random variables", "independence", "joint & marginal probability"]}, {"name": "Probability Distributions", "note": "st_distributions", "sub": ["Bernoulli", "Binomial", "Poisson", "Gaussian (Normal)", "Exponential", "Uniform"]}, {"name": "Correlation & Relationships", "note": "st_correlation", "sub": ["covariance", "Pearson correlation", "Spearman correlation", "multicollinearity", "causation vs correlation"]}, {"name": "Hypothesis Testing", "note": "st_hypothesis", "sub": ["p-value", "confidence intervals", "t-tests (one-sample, two-sample, paired)", "chi-square test", "ANOVA", "Type I & Type II errors"]}, {"name": "A/B Testing", "note": "st_abtesting", "sub": ["experiment design", "control vs treatment groups", "statistical significance", "sample size calculation", "business impact measurement"]}, {"name": "Linear Algebra", "note": "m_linalg", "sub": ["vectors", "matrices", "matrix multiplication", "dot product", "transpose", "inverse", "eigenvectors", "eigenvalues", "SVD", "PCA intuition"]}, {"name": "Calculus", "note": "m_calculus", "sub": ["derivatives", "partial derivatives", "gradients", "chain rule", "Jacobian", "Hessian", "gradient interpretation"]}, {"name": "Optimization", "note": "m_optimization", "sub": ["gradient descent", "stochastic gradient descent", "mini-batch gradient descent", "convex optimization", "learning rates", "loss landscapes", "momentum & adaptive methods"]}]}, {"num": "07", "name": "Machine Learning", "icon": "\ud83e\udd16", "tag": "Core", "desc": "Regression \u00b7 Classification \u00b7 Trees \u00b7 Clustering", "topics": [{"name": "ML Fundamentals", "note": "ml_intro", "sub": ["supervised learning", "unsupervised learning", "reinforcement learning basics", "bias-variance tradeoff", "overfitting & underfitting", "feature engineering", "sklearn pipelines", "cross validation (k-fold, stratified)", "train/val/test split", "data leakage", "feature scaling", "encoding (OHE, Label)"]}, {"name": "Core Concepts", "note": "ml_core", "sub": ["bias-variance decomposition", "loss functions", "gradient descent + Adam", "L1/L2 regularization", "nested cross-validation", "feature scaling"]}, {"name": "Regression", "note": "ml_regression", "sub": ["linear regression (OLS)", "ridge regression (L2)", "lasso regression (L1)", "elastic net", "polynomial regression", "assumptions & diagnostics"]}, {"name": "Classification", "note": "ml_classification", "sub": ["logistic regression", "Naive Bayes (Gaussian, Multinomial, Bernoulli)", "K-Nearest Neighbors", "Support Vector Machines", "SVM kernels (RBF, polynomial)", "decision boundaries"]}, {"name": "Tree-Based Models \u2605", "note": "ml_trees", "sub": ["decision trees (CART)", "information gain & Gini impurity", "random forest (bagging)", "feature importance", "gradient boosting", "XGBoost", "LightGBM", "CatBoost", "hyperparameter tuning", "early stopping"]}, {"name": "Clustering", "note": "ml_clustering", "sub": ["KMeans", "elbow method", "silhouette score", "DBSCAN", "hierarchical clustering", "dendrograms"]}, {"name": "Dimensionality Reduction", "note": "ml_dimred", "sub": ["PCA", "explained variance ratio", "t-SNE", "UMAP", "when to use each"]}, {"name": "Time Series Forecasting", "note": "ml_timeseries", "sub": ["trend & seasonality", "stationarity (ADF test)", "autocorrelation (ACF, PACF)", "ARIMA", "SARIMA", "Prophet", "feature engineering for time series"]}, {"name": "Recommendation Systems", "note": "ml_recsys", "sub": ["collaborative filtering", "content-based filtering", "matrix factorization", "ranking systems", "cold start problem", "implicit vs explicit feedback"]}, {"name": "Model Evaluation", "note": "ml_evaluation", "sub": ["confusion matrix", "precision", "recall", "F1-score", "ROC-AUC", "precision-recall curve", "log loss", "MAE", "RMSE", "R\u00b2", "MAPE"]}]}, {"num": "08", "name": "Deep Learning", "icon": "\ud83e\udde0", "tag": "Core", "desc": "PyTorch \u00b7 CNNs \u00b7 RNNs \u00b7 Attention", "topics": [{"name": "Neural Network Foundations", "note": "dl_foundations", "sub": ["perceptron", "forward propagation", "backpropagation", "activation functions (ReLU, sigmoid, tanh, softmax)", "loss functions", "optimizers (SGD, Adam, RMSprop)", "regularization (L1/L2)", "batch normalization", "dropout"]}, {"name": "PyTorch \u2605", "note": "dl_pytorch", "sub": ["tensors", "autograd", "Datasets & DataLoaders", "GPU training (CUDA)", "custom model classes (nn.Module)", "training loops", "model checkpointing", "transfer learning", "torch.save / torch.load"]}, {"name": "CNNs", "note": "dl_cnns", "sub": ["convolution operation", "kernels & filters", "pooling (max, average)", "padding & stride", "feature maps", "architecture design", "ResNet (skip connections)", "EfficientNet", "transfer learning with CNNs"]}, {"name": "RNNs & Sequential", "note": "dl_rnns", "sub": ["RNN architecture", "vanishing gradient problem", "LSTM", "GRU", "sequence-to-sequence models", "bidirectional RNNs"]}, {"name": "Attention Mechanisms", "note": "dl_attention", "sub": ["attention concept", "self-attention", "encoder-decoder attention", "scaled dot-product attention", "multi-head attention", "attention masking", "positional encoding", "Transformer architecture overview"]}]}, {"num": "09", "name": "Generative AI", "icon": "\u2728", "tag": "Advanced", "desc": "Transformers \u00b7 LLMs \u00b7 RAG \u00b7 Agents", "topics": [{"name": "Transformers & Attention \u2605", "note": "transformers", "sub": ["query, key, value", "self-attention", "multi-head attention", "positional encoding (sinusoidal, learned)", "encoder-decoder", "masked attention", "cross attention", "residual connections", "layer norm", "feedforward", "full transformer block"]}, {"name": "NLP Foundations", "note": "nlp", "sub": ["tokenization", "stemming", "lemmatization", "stopwords", "bag of words", "TF-IDF", "Word2Vec (CBOW, Skip-gram)", "GloVe", "FastText", "cosine similarity"]}, {"name": "Embeddings & Vector Search", "note": "vectordb", "sub": ["sentence embeddings", "semantic similarity", "embedding spaces", "ANN search", "HNSW", "IVF", "product quantization", "metadata filtering", "FAISS", "ChromaDB", "Pinecone", "Weaviate", "Milvus"]}, {"name": "RAG \u2605", "note": "rag", "sub": ["retrieval pipeline", "context injection", "grounding", "chunking strategies", "overlap", "metadata", "similarity search", "hybrid search", "reranking", "BM25", "conversational RAG", "graph RAG", "agentic RAG", "query rewriting"]}, {"name": "LangChain", "note": "langchain", "sub": ["chains", "LCEL", "Runnable protocol", "retrievers", "memory", "callbacks", "output parsers", "RunnableParallel", "RunnableLambda", "fallbacks"]}, {"name": "LangGraph", "note": "langgraph", "sub": ["graph-based workflows", "state management", "nodes & edges", "conditional edges", "checkpointing", "persistence", "human-in-the-loop"]}, {"name": "Agentic AI", "note": "agentic", "sub": ["planning", "reasoning loops", "tool usage", "function calling", "memory", "agent architectures", "ReAct", "multi-agent", "agent failure modes"]}, {"name": "Fine-Tuning", "note": "finetuning", "sub": ["SFT", "dataset prep", "LoRA", "QLoRA", "adapters", "PEFT", "quantization (8-bit, 4-bit)", "RLHF intuition", "instruction tuning"]}, {"name": "Prompt Engineering", "note": "prompting", "sub": ["system / user / role prompting", "zero-shot", "few-shot", "chain-of-thought", "self-consistency", "structured prompting", "hallucination mitigation", "prompt injection", "output validation"]}, {"name": "LLMOps & Production", "note": "llm_prod", "sub": ["FastAPI serving", "GPU inference", "batching", "streaming", "KV cache", "tensor parallelism", "speculative decoding", "vLLM", "TGI", "Ollama", "Triton", "cost optimization", "model routing"]}, {"name": "Evaluation & Monitoring", "note": "llm_evals", "sub": ["human eval", "automated eval", "hallucination detection", "groundedness", "context precision", "context recall", "answer relevance", "RAGAS", "drift", "token usage"]}]}, {"num": "10", "name": "MLOps & Deployment", "icon": "\ud83d\ude80", "tag": "Production", "desc": "MLflow \u00b7 Docker \u00b7 Kubernetes \u00b7 SageMaker", "topics": [{"name": "Foundations & Mental Models", "note": "mlops_lifecycle", "sub": ["ML lifecycle", "research vs production gap", "why notebooks fail", "MLOps vs DevOps vs DataOps", "maturity levels 0/1/2", "hidden technical debt", "tooling landscape"]}, {"name": "Versioning: Code, Data, Config", "note": "mlops_lifecycle", "sub": ["Git branching for ML", "Gitflow vs trunk-based", "DVC init/add/push/pull", "dvc.yaml pipelines", "dvc repro", "Hydra configs", "Pydantic schemas", "pre-commit hooks", "src layout"]}, {"name": "Data & Feature Pipelines", "note": "sd_serving", "sub": ["Sklearn Pipeline", "ColumnTransformer", "train-serve skew", "feature stores", "Feast", "online vs offline", "point-in-time joins", "Great Expectations", "Pandera", "Airflow", "Prefect"]}, {"name": "Experiment Tracking & Registry", "note": "mlops_mlflow", "sub": ["MLflow tracking", "log_param / log_metric / log_artifact", "Optuna", "pruning", "Ray Tune", "model registry", "staging \u2192 production \u2192 archived", "reproducibility", "seed management"]}, {"name": "CI/CD for ML", "note": "mlops_deploy", "sub": ["Docker multi-stage builds", "NVIDIA Container Toolkit", "CI vs CD", "Jenkins", "Jenkinsfile", "GitHub Actions", "matrix builds", "self-hosted runners", "GitLab CI"]}, {"name": "Model Serving & Inference", "note": "mlops_deploy", "sub": ["batch inference", "real-time REST", "streaming", "shadow mode", "FastAPI serving", "lifespan events", "health/readiness", "BentoML", "Seldon Core", "KServe", "ONNX", "quantization"]}, {"name": "Kubernetes for ML", "note": "mlops_deploy", "sub": ["Pods, Deployments, Services", "ConfigMaps & Secrets", "PersistentVolumes", "resource requests/limits", "GPU scheduling", "HPA", "Helm charts", "rolling update", "blue-green", "canary", "Kubeflow", "KServe"]}, {"name": "Cloud ML Platforms & IaC", "note": "mlops_deploy", "sub": ["SageMaker training jobs", "SageMaker Pipelines", "SageMaker endpoints", "Vertex AI", "Azure ML", "Terraform", "Pulumi", "spot instances"]}, {"name": "Monitoring & Retraining", "note": "sd_monitoring", "sub": ["data vs concept vs model drift", "PSI", "KS test", "Evidently AI", "structured logging", "EFK stack", "Prometheus", "Grafana", "SLOs / SLAs", "champion-challenger", "retraining triggers"]}, {"name": "Pipeline Orchestration", "note": "de_etl", "sub": ["DAG-based pipelines", "Airflow architecture", "PythonOperator", "XComs", "SensorOperators", "TaskGroups", "CeleryExecutor vs KubernetesExecutor", "Prefect flows", "end-to-end pipelines"]}, {"name": "Testing, Governance & Security", "note": null, "sub": ["unit tests for features", "integration tests", "model performance tests", "load testing (Locust, k6)", "slice-based evaluation", "model cards", "SHAP / LIME", "GDPR / EU AI Act", "Vault", "RBAC", "image scanning (Trivy)"]}, {"name": "GenAI & LLM MLOps", "note": "llm_prod", "sub": ["vLLM PagedAttention", "TGI", "Triton", "GPTQ / AWQ", "tensor parallelism", "vector store management", "embedding versioning", "RAGAS", "hallucination metrics", "LLM-as-judge", "TTFT / TBT", "LoRA / QLoRA pipelines", "FSDP / DeepSpeed"]}]}, {"num": "11", "name": "Data Engineering", "icon": "\ud83d\udd27", "tag": "Production", "desc": "ETL \u00b7 Apache Spark \u00b7 Kafka", "topics": [{"name": "ETL Pipelines", "note": "de_etl", "sub": ["extraction (APIs, databases, files)", "transformation (cleaning, enriching, normalizing)", "loading (data warehouse, S3, database)", "orchestration (Airflow, Prefect, Luigi)", "pipeline idempotency", "error handling"]}, {"name": "Apache Spark", "note": "de_spark", "sub": ["Spark architecture (driver, executors)", "Spark DataFrames", "transformations (lazy)", "actions (eager)", "Spark SQL", "joins at scale", "partitioning", "PySpark"]}, {"name": "Kafka", "note": "de_kafka", "sub": ["producers & consumers", "topics & partitions", "consumer groups", "offset management", "streaming pipelines", "Kafka Connect", "Kafka Streams"]}]}, {"num": "12", "name": "ML System Design", "icon": "\ud83c\udfd7\ufe0f", "tag": "Senior", "desc": "Feature Stores \u00b7 Drift \u00b7 Serving", "topics": [{"name": "ML System Design Patterns", "note": "sd_framework", "sub": ["recommendation system design", "forecasting system design", "real-time inference architecture", "feature stores (Feast, Tecton)", "online vs offline serving", "model monitoring architecture", "drift detection", "shadow deployment", "A/B testing infrastructure", "feedback loops", "retraining pipelines"]}]}, {"num": "13", "name": "Data Structures & Algorithms", "icon": "\ud83c\udf32", "tag": "Interview", "desc": "17 phases \u00b7 Basics to MAANG level", "topics": [{"name": "Complexity & Python Internals", "note": "dsa_complexity", "sub": ["Big O notation [must]", "time vs space tradeoffs [must]", "Python list internals [must]", "Python dict internals [must]", "recursion & call stack [must]"]}, {"name": "Arrays & Strings", "note": "dsa_arrays", "sub": ["array basics [must]", "two pointers [must][pattern]", "sliding window [must][pattern]", "prefix sums [must][pattern]", "Kadane's algorithm [must]", "string manipulation [must]", "matrix / 2D arrays [pattern]"]}, {"name": "Hashing", "note": "dsa_hashing", "sub": ["how hash maps work [must]", "dict & set patterns [must][pattern]", "two sum pattern [must][pattern]", "group anagrams [must]", "subarray problems with hashing [pattern]"]}, {"name": "Linked Lists", "note": "dsa_linkedlist", "sub": ["singly linked list [must]", "doubly linked list [must]", "fast & slow pointers [must][pattern]", "reverse a linked list [must]", "merge two sorted lists [must]", "LRU Cache [must][hard]"]}, {"name": "Stacks & Queues", "note": "dsa_stacks", "sub": ["stack \u2014 LIFO [must]", "queue & deque \u2014 FIFO [must]", "valid parentheses [must]", "monotonic stack [must][pattern]", "min stack [must]", "sliding window maximum [pattern][hard]"]}, {"name": "Binary Search", "note": "dsa_binsearch", "sub": ["classic binary search [must]", "find leftmost / rightmost [must]", "binary search on answer [must][pattern]", "search in rotated array [must]", "2D binary search [pattern]"]}, {"name": "Trees", "note": "dsa_trees", "sub": ["binary tree basics [must]", "DFS \u2014 inorder, preorder, postorder [must]", "BFS / level order [must]", "binary search tree (BST) [must]", "tree path problems [must][pattern]", "lowest common ancestor [must]", "construct tree from traversals [hard]", "balanced & diameter [must]"]}, {"name": "Heaps & Priority Queue", "note": "dsa_heaps", "sub": ["how a heap works [must]", "heapq in Python [must]", "top K elements [must][pattern]", "Kth largest in stream [must]", "merge K sorted lists [must][hard]", "task scheduler [hard]", "find median from data stream [hard]"]}, {"name": "Graphs", "note": "dsa_graphs", "sub": ["graph representations [must]", "DFS on graphs [must]", "BFS on graphs [must]", "cycle detection [must]", "topological sort [must][pattern]", "Union Find (DSU) [must][pattern]", "Dijkstra's algorithm [must]", "Bellman-Ford [hard]", "minimum spanning tree [hard]", "bipartite check [pattern]"]}, {"name": "Backtracking", "note": "dsa_backtrack", "sub": ["backtracking template [must][pattern]", "subsets & permutations [must]", "combination sum [must]", "word search [must]", "N-Queens [hard]", "Sudoku solver [hard]"]}, {"name": "Dynamic Programming", "note": "dsa_dp", "sub": ["memoisation (top-down) [must]", "tabulation (bottom-up) [must]", "1D DP [must]", "2D DP [must]", "knapsack pattern [must][pattern]", "string DP [hard]", "interval DP [hard]", "DP on trees [hard]", "DP with bitmask [hard]"]}, {"name": "Tries", "note": "dsa_tries", "sub": ["trie from scratch [must]", "prefix search [must]", "word search II [hard]", "replace words [pattern]"]}, {"name": "Bit Manipulation", "note": "dsa_bits", "sub": ["bitwise operators [must]", "XOR tricks [must][pattern]", "check / set / clear a bit [must]", "count set bits [must]", "power of two [pattern]", "subsets using bitmask [pattern]"]}, {"name": "Advanced Data Structures", "note": "dsa_advanced", "sub": ["segment tree [hard]", "Fenwick tree (BIT) [hard]", "monotonic deque [pattern][hard]", "sparse table [hard]"]}, {"name": "Sorting Algorithms (Deep)", "note": "dsa_sorting", "sub": ["merge sort [must]", "quick sort [must]", "counting / radix sort [pattern]", "custom sort with comparator [must]"]}, {"name": "Intervals & Greedy", "note": "dsa_greedy", "sub": ["interval merge pattern [must][pattern]", "insert interval [must]", "meeting rooms [must]", "greedy strategy [must]", "jump game I & II [must]", "gas station [hard]"]}, {"name": "Math & Number Theory", "note": "dsa_math", "sub": ["GCD & LCM [must]", "prime numbers & Sieve [pattern]", "modular arithmetic [must]", "fast exponentiation [pattern]", "combinatorics basics [pattern]"]}, {"name": "Problem Tracker", "note": "dsa_problems", "sub": ["265 problems across all patterns"]}]}]
;
