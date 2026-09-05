import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import "./Notes.css";

/* =========================================================
   DEFAULT NOTES
   ========================================================= */

const DEFAULT_NOTES = [
    {
        id: 1,
        title: "Java OOPs Concepts",
        category: "Java",
        tag: "Core Java",
        description:
            "Important concepts of Object-Oriented Programming including inheritance, polymorphism, abstraction and encapsulation.",
        content: `Object-Oriented Programming is one of the most important concepts in Java.

Key concepts:

1. Encapsulation
   - Binding data and methods together.
   - Usually implemented using classes and access modifiers.

2. Inheritance
   - Allows one class to acquire properties and behaviour of another class.
   - Java supports single, multilevel and hierarchical inheritance.

3. Polymorphism
   - One interface with multiple implementations.
   - Method overloading and overriding are common examples.

4. Abstraction
   - Hides implementation details.
   - Achieved using abstract classes and interfaces.

Interview Tip:
Always understand the difference between method overloading and method overriding.`,
        pinned: true,
        favorite: true,
        createdAt: "2026-08-20T10:30:00",
        updatedAt: "2026-08-28T14:20:00"
    },

    {
        id: 2,
        title: "Spring Boot Basics",
        category: "Spring Boot",
        tag: "Backend",
        description:
            "Quick revision notes covering dependency injection, REST controllers, services and repositories.",
        content: `Spring Boot simplifies the development of Java backend applications.

Important concepts:

• @SpringBootApplication
• @RestController
• @Service
• @Repository
• Dependency Injection
• Spring Data JPA
• REST APIs

Typical architecture:

Controller
    ↓
Service
    ↓
Repository
    ↓
Database

Interview Tip:
Understand why constructor injection is preferred over field injection.`,
        pinned: false,
        favorite: true,
        createdAt: "2026-08-18T09:00:00",
        updatedAt: "2026-08-27T18:40:00"
    },

    {
        id: 3,
        title: "React Hooks",
        category: "React",
        tag: "Frontend",
        description:
            "Revision notes for useState, useEffect, useMemo and other commonly used React hooks.",
        content: `React Hooks allow functional components to use state and other React features.

useState:
Used to maintain component state.

useEffect:
Used for side effects such as API calls.

useMemo:
Used to memoize expensive calculations.

useCallback:
Used to memoize functions.

Important:
Do not call hooks conditionally.`,
        pinned: false,
        favorite: false,
        createdAt: "2026-08-17T12:30:00",
        updatedAt: "2026-08-26T16:00:00"
    },

    {
        id: 4,
        title: "DBMS Interview Revision",
        category: "DBMS",
        tag: "Interview",
        description:
            "Important DBMS concepts for technical interviews and placement preparation.",
        content: `Important DBMS topics:

• Primary Key
• Foreign Key
• Candidate Key
• Normalization
• Transactions
• ACID Properties
• Indexing
• Joins
• SQL Queries

ACID:

Atomicity
Consistency
Isolation
Durability

Interview Tip:
Be comfortable writing INNER JOIN, LEFT JOIN and GROUP BY queries.`,
        pinned: false,
        favorite: false,
        createdAt: "2026-08-15T08:20:00",
        updatedAt: "2026-08-25T13:15:00"
    },

    {
        id: 5,
        title: "Data Structures Revision",
        category: "DSA",
        tag: "Placement",
        description:
            "Quick revision of arrays, linked lists, stacks, queues, trees and graphs.",
        content: `Data Structures:

Arrays
- Contiguous memory
- Fast random access

Linked List
- Dynamic structure
- Nodes connected using references

Stack
- LIFO

Queue
- FIFO

Trees
- Hierarchical data structure

Graphs
- Vertices and edges

Important:
Focus on time and space complexity while solving problems.`,
        pinned: true,
        favorite: false,
        createdAt: "2026-08-10T11:00:00",
        updatedAt: "2026-08-24T19:30:00"
    },

    {
        id: 6,
        title: "SQL Query Cheatsheet",
        category: "SQL",
        tag: "Database",
        description:
            "Useful SQL commands and query patterns for everyday development and interviews.",
        content: `Common SQL commands:

SELECT
INSERT
UPDATE
DELETE
CREATE
ALTER
DROP

Example:

SELECT name, email
FROM students
WHERE department = 'IT';

Aggregation:

SELECT department, COUNT(*)
FROM students
GROUP BY department;`,
        pinned: false,
        favorite: true,
        createdAt: "2026-08-08T15:00:00",
        updatedAt: "2026-08-23T10:10:00"
    }
];

/* =========================================================
   MASTER SKILL / SUBJECT CATALOG
   =========================================================

   Notes are still stored locally exactly as before. The only new
   behavior is that the Subjects rail is now connected to the same
   master skill catalog used by the Skills / Resources experience.

   Primary source:
       GET /api/skills

   Fallback source:
       GET /api/skills/all

   The fallback list below is intentionally used only when the API is
   unavailable. Once the API responds, the backend catalog becomes the
   source of truth, so the Notes page does not drift away from the
   platform's skill catalog.
   ========================================================= */

const FALLBACK_MASTER_SUBJECTS = [
    "Java",
    "Spring Boot",
    "React",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "Python",
    "C",
    "C++",
    "SQL",
    "DBMS",
    "DSA",
    "Operating System",
    "Computer Networks",
    "Git",
    "GitHub",
    "REST API",
    "Microservices",
    "Hibernate",
    "JPA",
    "Spring Security",
    "Spring Data JPA",
    "Maven",
    "Gradle",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Linux",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Kafka",
    "System Design",
    "Design Patterns",
    "OOP",
    "Data Structures",
    "Algorithms",
    "Aptitude",
    "Problem Solving",
    "Computer Architecture",
    "Software Engineering",
    "Testing",
    "JUnit",
    "CI/CD",
    "DevOps",
    "Tailwind CSS",
    "Node.js",
    "Express.js",
    "Next.js",
    "Bootstrap",
    "Web Development",
    "Communication Skills"
];

const getSkillName = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number") {
        return String(value).trim();
    }

    if (typeof value === "object") {
        const candidate =
            value.name ??
            value.skillName ??
            value.skill ??
            value.title ??
            value.label ??
            value.value ??
            value.technology;

        return typeof candidate === "string"
            ? candidate.trim()
            : candidate !== null && candidate !== undefined
                ? String(candidate).trim()
                : "";
    }

    return "";
};

const collectSkillNames = (value, result = []) => {
    if (value === null || value === undefined) {
        return result;
    }

    if (Array.isArray(value)) {
        value.forEach((item) =>
            collectSkillNames(item, result)
        );
        return result;
    }

    if (typeof value === "object") {
        const directName = getSkillName(value);

        if (directName) {
            result.push(directName);
            return result;
        }

        [
            value.skills,
            value.data,
            value.content,
            value.items,
            value.results,
            value.records
        ].forEach((nested) => {
            if (nested !== undefined && nested !== null) {
                collectSkillNames(nested, result);
            }
        });

        return result;
    }

    const directName = getSkillName(value);

    if (directName) {
        result.push(directName);
    }

    return result;
};

const normalizeSkillKey = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[._/-]+/g, " ")
        .replace(/\s+/g, " ");

const uniqueSkillNames = (values) => {
    const seen = new Set();
    const output = [];

    values.forEach((value) => {
        const name = getSkillName(value);
        const key = normalizeSkillKey(name);

        if (!name || !key || seen.has(key)) {
            return;
        }

        seen.add(key);
        output.push(name);
    });

    return output;
};

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "aiMentorNotes";

const loadNotes = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return DEFAULT_NOTES;
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : DEFAULT_NOTES;
    } catch (error) {
        console.warn("Unable to load notes:", error);
        return DEFAULT_NOTES;
    }
};

/* =========================================================
   HELPERS
   ========================================================= */

const formatDate = (date) => {
    if (!date) {
        return "Recently";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(date));
};

const formatShortDate = (date) => {
    if (!date) {
        return "Recently";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short"
    }).format(new Date(date));
};

const getCategoryIcon = (category) => {
    const icons = {
        Java: "bi-cup-hot-fill",
        "Spring Boot": "bi-box-seam-fill",
        React: "bi-code-square",
        DBMS: "bi-database-fill",
        DSA: "bi-diagram-3-fill",
        SQL: "bi-table",
        JavaScript: "bi-filetype-js",
        Python: "bi-filetype-py",
        CN: "bi-globe2",
        OS: "bi-pc-display-horizontal"
    };

    return icons[category] || "bi-journal-text";
};

const getCategoryClass = (category) => {
    return String(category || "general")
        .toLowerCase()
        .replace(/\s+/g, "-");
};

/* =========================================================
   COMPONENT
   ========================================================= */


/* =========================================================
   AUTO NOTES FOR EVERY MASTER SUBJECT
   ========================================================= */

const SUBJECT_NOTE_DETAILS = {
    Java: ["OOP", "Collections", "Exception Handling", "Streams", "Multithreading"],
    "Spring Boot": ["Dependency Injection", "REST Controllers", "Services", "Repositories", "Spring Data JPA"],
    React: ["Components", "Props and State", "Hooks", "Routing", "API Integration"],
    JavaScript: ["Variables", "Functions", "Closures", "Promises", "Async/Await"],
    TypeScript: ["Types", "Interfaces", "Generics", "Union Types", "Type Narrowing"],
    HTML: ["Semantic HTML", "Forms", "Accessibility", "Tables", "Media"],
    CSS: ["Box Model", "Flexbox", "Grid", "Responsive Design", "Specificity"],
    Python: ["Data Types", "Functions", "Collections", "OOP", "Exception Handling"],
    C: ["Pointers", "Arrays", "Functions", "Structures", "Dynamic Memory"],
    "C++": ["OOP", "STL", "Vectors", "References", "Templates"],
    SQL: ["SELECT", "JOINs", "GROUP BY", "Subqueries", "Indexes"],
    DBMS: ["Keys", "Normalization", "ACID", "Transactions", "Indexes"],
    DSA: ["Arrays", "Linked Lists", "Stacks", "Trees", "Graphs"],
    "Operating System": ["Processes", "Threads", "Scheduling", "Deadlocks", "Memory Management"],
    "Computer Networks": ["OSI Model", "TCP/UDP", "IP", "DNS", "HTTP/HTTPS"],
    Git: ["Repository", "Commit", "Branch", "Merge", "Rebase"],
    GitHub: ["Repositories", "Branches", "Pull Requests", "Issues", "Actions"],
    "REST API": ["HTTP Methods", "Status Codes", "JSON", "Validation", "Authentication"],
    Microservices: ["Service Boundaries", "Communication", "Discovery", "Resilience", "Observability"],
    Hibernate: ["Entities", "Mappings", "Persistence Context", "Fetching", "Transactions"],
    JPA: ["Entity", "Relationships", "EntityManager", "JPQL", "Transactions"],
    "Spring Security": ["Authentication", "Authorization", "SecurityFilterChain", "JWT", "Roles"],
    "Spring Data JPA": ["JpaRepository", "Derived Queries", "@Query", "Pagination", "Sorting"],
    Maven: ["pom.xml", "Dependencies", "Plugins", "Lifecycle", "Profiles"],
    Gradle: ["build.gradle", "Dependencies", "Tasks", "Plugins", "Wrapper"],
    Docker: ["Images", "Containers", "Dockerfile", "Volumes", "Docker Compose"],
    Kubernetes: ["Pods", "Deployments", "Services", "ConfigMaps", "Scaling"],
    AWS: ["EC2", "S3", "RDS", "IAM", "VPC"],
    Azure: ["Virtual Machines", "App Services", "Storage", "Azure SQL", "Identity"],
    Linux: ["Filesystem", "Permissions", "Processes", "Shell", "SSH"],
    PostgreSQL: ["SQL", "Indexes", "Transactions", "JSONB", "Query Planning"],
    MySQL: ["SQL", "Joins", "Indexes", "Transactions", "Storage Engines"],
    MongoDB: ["Documents", "Collections", "CRUD", "Indexes", "Aggregation"],
    Redis: ["Key-Value", "Caching", "TTL", "Hashes", "Pub/Sub"],
    Kafka: ["Topics", "Partitions", "Producers", "Consumers", "Consumer Groups"],
    "System Design": ["Requirements", "Scalability", "Load Balancing", "Caching", "Databases"],
    "Design Patterns": ["Factory", "Builder", "Strategy", "Observer", "Adapter"],
    OOP: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction", "Composition"],
    "Data Structures": ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees"],
    Algorithms: ["Searching", "Sorting", "Recursion", "Greedy", "Dynamic Programming"],
    Aptitude: ["Percentages", "Ratios", "Averages", "Time and Work", "Probability"],
    "Problem Solving": ["Constraints", "Examples", "Approach", "Edge Cases", "Complexity"],
    "Computer Architecture": ["CPU", "Registers", "Cache", "Memory", "Pipelining"],
    "Software Engineering": ["Requirements", "Design", "Version Control", "Testing", "Agile"],
    Testing: ["Unit Testing", "Integration Testing", "Regression", "Test Cases", "Automation"],
    JUnit: ["@Test", "Assertions", "Fixtures", "Parameterized Tests", "Test Suites"],
    "CI/CD": ["Continuous Integration", "Build", "Automated Tests", "Artifacts", "Deployment"],
    DevOps: ["Automation", "CI/CD", "Containers", "Monitoring", "Infrastructure"],
    "Tailwind CSS": ["Utilities", "Responsive Classes", "Flexbox", "Grid", "Components"],
    "Node.js": ["Event Loop", "Modules", "npm", "Async I/O", "HTTP"],
    "Express.js": ["Routes", "Middleware", "Controllers", "Errors", "Authentication"],
    "Next.js": ["Routing", "Server Components", "Data Fetching", "Rendering", "Optimization"],
    Bootstrap: ["Grid", "Containers", "Cards", "Forms", "Responsive Utilities"],
    "Web Development": ["Frontend", "Backend", "REST APIs", "Databases", "Deployment"],
    "Communication Skills": ["Clear Speaking", "Active Listening", "Structured Answers", "Presentation", "Team Communication"]
};

const SUBJECT_NOTE_PROFILES = {
    Java: {
        overview: "Java is a strongly typed, object-oriented language widely used for backend systems, enterprise applications and Android development. For interviews, focus on how the JVM, OOP, collections, exceptions, streams and concurrency work together rather than memorizing definitions.",
        practical: "Build a small service that reads data, stores objects in collections, handles invalid input with exceptions and uses streams for filtering or aggregation.",
        interview: "Be ready to explain JDK vs JRE vs JVM, String immutability, equals/hashCode, HashMap internals, checked vs unchecked exceptions, streams and thread-safety."
    },
    "Spring Boot": {
        overview: "Spring Boot simplifies production-ready Java application development by providing auto-configuration, dependency injection, embedded servers and a strong ecosystem for REST APIs and data access.",
        practical: "Create a layered REST API with Controller, Service and Repository classes, validate requests, handle exceptions centrally and persist entities with Spring Data JPA.",
        interview: "Know dependency injection, IoC, bean scopes, auto-configuration, configuration properties, profiles, REST controllers and the difference between @Component, @Service and @Repository."
    },
    React: {
        overview: "React is a component-based library for building interactive user interfaces. Its core ideas are declarative rendering, one-way data flow, state management and reusable components.",
        practical: "Build a dashboard with reusable cards, forms and lists; fetch data from an API, show loading and error states, and update the UI when state changes.",
        interview: "Understand props vs state, controlled components, useEffect dependencies, useMemo/useCallback, keys, lifting state and why unnecessary renders happen."
    },
    JavaScript: {
        overview: "JavaScript powers browser interactions and is also used on servers. Its most important interview areas include execution context, closures, objects, asynchronous programming and the event loop.",
        practical: "Build a small API-driven page using fetch, async/await, array methods and DOM or React state updates while handling failures cleanly.",
        interview: "Know var/let/const, hoisting, closures, this, prototypes, promises, event loop, microtasks, map/filter/reduce and shallow vs deep copying."
    },
    TypeScript: {
        overview: "TypeScript adds static typing to JavaScript so large applications become easier to refactor, validate and maintain. Types describe the shape and constraints of data before runtime.",
        practical: "Define interfaces for API responses, typed component props and reusable generic utility functions, then let the compiler catch invalid assumptions.",
        interview: "Be comfortable with interfaces vs type aliases, unions, intersections, generics, narrowing, optional properties, enums and structural typing."
    },
    HTML: {
        overview: "HTML defines the semantic structure of a web page. Good HTML improves accessibility, SEO, maintainability and the way browsers and assistive technologies interpret content.",
        practical: "Create a semantic page using header, nav, main, section, article and footer elements, with accessible forms and meaningful labels.",
        interview: "Know semantic elements, forms, input types, labels, accessibility basics, block vs inline behavior and why valid document structure matters."
    },
    CSS: {
        overview: "CSS controls presentation and layout. Professional interfaces depend on understanding the cascade, specificity, box model, responsive design and modern layout systems such as Flexbox and Grid.",
        practical: "Build a responsive dashboard that adapts from desktop to mobile using Grid/Flexbox, reusable variables, consistent spacing and accessible focus states.",
        interview: "Understand specificity, inheritance, box sizing, positioning, Flexbox, Grid, media queries, pseudo-classes and common overflow problems."
    },
    Python: {
        overview: "Python is a high-level language valued for readable syntax and a large ecosystem across automation, data, backend development and AI. Its object model and built-in collections are especially important.",
        practical: "Write a small command-line program that validates input, processes lists and dictionaries, uses functions/classes and handles exceptions.",
        interview: "Review mutability, list/dict/set operations, comprehensions, generators, decorators, exception handling, OOP and Python's execution model."
    },
    C: {
        overview: "C provides low-level control over memory and system resources. It is useful for understanding pointers, arrays, stack/heap memory and how programs interact with hardware.",
        practical: "Implement a small program using arrays, structures and dynamically allocated memory, then carefully release allocated memory.",
        interview: "Know pointers, pointer arithmetic, stack vs heap, malloc/calloc/realloc/free, structs, arrays and common memory errors."
    },
    "C++": {
        overview: "C++ combines low-level control with object-oriented and generic programming. Its Standard Template Library makes it especially important for competitive programming and DSA interviews.",
        practical: "Use vector, map, set, queue and algorithms to solve a problem while applying references, classes and RAII where appropriate.",
        interview: "Review references vs pointers, constructors/destructors, virtual functions, STL containers, iterators, templates and smart pointers."
    },
    SQL: {
        overview: "SQL is the language used to query and manipulate relational data. Strong SQL skills require understanding joins, aggregation, subqueries, constraints, indexes and query behavior.",
        practical: "Create tables for students and courses, write joins and aggregation queries, then add an index and compare the query plan.",
        interview: "Practice JOIN types, GROUP BY/HAVING, subqueries, NULL behavior, window functions, indexes and normalization-related questions."
    },
    DBMS: {
        overview: "A DBMS manages persistent data while providing consistency, concurrency, security and recovery. Interview preparation should connect theory such as ACID and normalization to real database behavior.",
        practical: "Design a normalized schema, create transactions for related updates and add indexes for frequently filtered columns.",
        interview: "Know primary/foreign keys, normalization, ACID, transactions, isolation levels, locks, indexing and SQL vs NoSQL trade-offs."
    },
    DSA: {
        overview: "Data Structures and Algorithms provide reusable ways to organize data and solve problems efficiently. Interview success depends on choosing the right structure and analyzing time and space complexity.",
        practical: "For every problem, identify constraints, propose a brute-force solution, optimize it and test edge cases before coding.",
        interview: "Be fluent with arrays, strings, linked lists, stacks, queues, trees, graphs, hashing, sorting, searching and complexity analysis."
    },
    "Operating System": {
        overview: "An operating system manages CPU, memory, processes, files and devices. Understanding these abstractions explains how applications actually run on a machine.",
        practical: "Trace a program from process creation through CPU scheduling, memory allocation and file I/O, noting where context switches occur.",
        interview: "Review process vs thread, scheduling algorithms, deadlocks, virtual memory, paging, synchronization, system calls and file systems."
    },
    "Computer Networks": {
        overview: "Computer networking explains how machines communicate reliably across local and global networks. Interview questions often connect OSI/TCP-IP layers with practical web requests.",
        practical: "Trace a browser request from DNS lookup through TCP/TLS setup to HTTP response and identify the role of each layer.",
        interview: "Know OSI/TCP-IP, TCP vs UDP, IP addressing, DNS, HTTP/HTTPS, TLS, routing, ports and common status codes."
    },
    Git: {
        overview: "Git is a distributed version-control system that records project history through commits and branches. Professional usage depends on clean history, safe collaboration and recovery skills.",
        practical: "Create a feature branch, make focused commits, rebase or merge with the main branch and resolve a controlled conflict.",
        interview: "Understand working tree vs staging area vs repository, merge vs rebase, reset vs revert, stash and conflict resolution."
    },
    GitHub: {
        overview: "GitHub provides collaboration, repository hosting and automation around Git projects. A professional workflow uses branches, pull requests, reviews, issues and CI checks.",
        practical: "Open a feature branch, push it, create a pull request, document the change and use automated checks before merging.",
        interview: "Know pull requests, protected branches, reviews, issues, Actions, repository permissions and basic CI workflows."
    },
    "REST API": {
        overview: "REST APIs expose resources over HTTP using predictable URLs, methods, representations and status codes. Good API design emphasizes consistency, validation, security and clear contracts.",
        practical: "Design CRUD endpoints for a resource, validate input, return appropriate HTTP status codes and document request/response JSON.",
        interview: "Review GET/POST/PUT/PATCH/DELETE, idempotency, status codes, pagination, validation, authentication and versioning."
    },
    Microservices: {
        overview: "Microservices split a system into independently deployable services around meaningful business boundaries. The architecture improves autonomy but introduces distributed-system complexity.",
        practical: "Separate an e-commerce example into product, order and user services, then define API contracts and failure behavior between them.",
        interview: "Discuss service boundaries, synchronous vs asynchronous communication, discovery, resilience, distributed transactions and observability."
    },
    Hibernate: {
        overview: "Hibernate is an ORM that maps Java objects to relational tables and manages persistence. Understanding its persistence context and fetching behavior prevents common performance bugs.",
        practical: "Map entities with relationships, persist them through a transaction and inspect generated SQL when loading associated data.",
        interview: "Know entity states, first-level cache, lazy vs eager loading, N+1 queries, cascading, mappings and transaction boundaries."
    },
    JPA: {
        overview: "JPA is the Java persistence specification for mapping objects to relational databases. It defines APIs and annotations while providers such as Hibernate implement the behavior.",
        practical: "Define entities and relationships, use EntityManager or repositories, write JPQL and control transactions around updates.",
        interview: "Review EntityManager, entity lifecycle, JPQL, relationships, fetch strategies, persistence context and optimistic locking."
    },
    "Spring Security": {
        overview: "Spring Security provides authentication and authorization infrastructure for Spring applications. A secure design separates identity verification from permission checks.",
        practical: "Protect REST endpoints with authenticated requests, role-based authorization and a clear password/token strategy.",
        interview: "Know SecurityFilterChain, authentication vs authorization, password encoding, JWT flow, roles/authorities and CSRF basics."
    },
    "Spring Data JPA": {
        overview: "Spring Data JPA reduces persistence boilerplate by providing repository abstractions, derived queries, JPQL support, pagination and sorting.",
        practical: "Create a JpaRepository, implement derived queries and @Query methods, then add pagination and sorting to a REST endpoint.",
        interview: "Understand repository interfaces, derived query naming, @Query, transactions, pagination, sorting and fetch-related pitfalls."
    },
    Maven: {
        overview: "Maven is a Java build and dependency-management tool based on a standard project lifecycle. The pom.xml describes project metadata, dependencies and plugins.",
        practical: "Build a Spring project, inspect its dependency tree, run tests and package the application using Maven lifecycle phases.",
        interview: "Know pom.xml, dependency scopes, lifecycle phases, plugins, repositories, profiles and dependency conflicts."
    },
    Gradle: {
        overview: "Gradle is a flexible build automation system using declarative build scripts and tasks. It is common in modern Java and Android ecosystems.",
        practical: "Define dependencies and custom tasks, run tests and package a Java application through the Gradle wrapper.",
        interview: "Review build.gradle, tasks, plugins, dependency configurations, Gradle Wrapper and incremental builds."
    },
    Docker: {
        overview: "Docker packages applications and their dependencies into portable containers. The key concepts are images, containers, layers, networking, volumes and reproducible builds.",
        practical: "Write a Dockerfile for a backend application, build an image, run it with environment variables and persist required data through a volume.",
        interview: "Know image vs container, Dockerfile instructions, layers, ports, volumes, networks and Docker Compose."
    },
    Kubernetes: {
        overview: "Kubernetes orchestrates containers across a cluster and automates deployment, networking and scaling. Its abstraction model separates desired state from the underlying machines.",
        practical: "Deploy an application with a Deployment and Service, configure environment values and scale replicas while observing pod health.",
        interview: "Know Pods, Deployments, Services, ConfigMaps, Secrets, probes, namespaces, rolling updates and horizontal scaling."
    },
    AWS: {
        overview: "AWS provides cloud infrastructure and managed services. For a Java full-stack project, understanding compute, storage, databases, identity and networking is more useful than memorizing every service.",
        practical: "Map a web application to EC2 or a managed compute service, S3 for objects, RDS for relational data and IAM for access control.",
        interview: "Review EC2, S3, RDS, IAM, VPC, security groups, regions, availability zones and basic cost awareness."
    },
    Azure: {
        overview: "Azure is Microsoft's cloud platform with services for compute, storage, databases, networking and identity. Learn the common building blocks and how they map to application needs.",
        practical: "Deploy a simple web application, connect it to Azure SQL or storage and restrict access through identity and network controls.",
        interview: "Know Virtual Machines, App Service, storage accounts, Azure SQL, resource groups and Microsoft Entra identity basics."
    },
    Linux: {
        overview: "Linux is widely used for servers and development environments. Strong fundamentals include the filesystem, permissions, processes, networking and shell tooling.",
        practical: "Navigate a server through the shell, inspect processes and logs, change permissions and use SSH to manage a remote environment.",
        interview: "Review common shell commands, chmod/chown, processes, signals, environment variables, pipes, grep and SSH."
    },
    PostgreSQL: {
        overview: "PostgreSQL is a powerful open-source relational database with strong SQL support, transactions, indexing and advanced data types such as JSONB.",
        practical: "Design a normalized schema, create indexes, inspect EXPLAIN output and use transactions for multi-step updates.",
        interview: "Know indexes, transactions, MVCC, JSONB, joins, query planning, constraints and PostgreSQL-specific features."
    },
    MySQL: {
        overview: "MySQL is a widely used relational database for web applications. Effective use requires strong SQL fundamentals plus awareness of indexes, transactions and storage engines.",
        practical: "Build a small relational schema, optimize common queries with indexes and test transaction behavior under updates.",
        interview: "Review joins, indexes, transactions, isolation, constraints, InnoDB and common query optimization techniques."
    },
    MongoDB: {
        overview: "MongoDB is a document database that stores JSON-like documents. Schema design should follow access patterns and balance embedding with referencing.",
        practical: "Model a small application using collections, perform CRUD operations, add indexes and use aggregation for reporting.",
        interview: "Know documents vs collections, embedding vs referencing, indexes, aggregation, transactions and when NoSQL is appropriate."
    },
    Redis: {
        overview: "Redis is an in-memory data store commonly used for caching, counters, sessions and messaging. Its speed comes with trade-offs around memory and persistence.",
        practical: "Cache an expensive API response with a TTL, invalidate it after writes and measure the effect of cache hits.",
        interview: "Know key-value operations, TTL, eviction, hashes, lists, sets, pub/sub and cache invalidation strategies."
    },
    Kafka: {
        overview: "Apache Kafka is a distributed event-streaming platform. Producers publish records to topics, partitions provide parallelism and consumers process records with offsets.",
        practical: "Create a topic, publish order events, consume them with a consumer group and observe how partitions distribute work.",
        interview: "Understand topics, partitions, offsets, producers, consumers, consumer groups, ordering and delivery semantics."
    },
    "System Design": {
        overview: "System design is the practice of turning product requirements into scalable, reliable and maintainable architecture. Start with requirements before selecting technologies.",
        practical: "Design a URL shortener or e-commerce backend, estimate traffic, identify bottlenecks and introduce caching, load balancing and database strategies where justified.",
        interview: "Cover functional/non-functional requirements, capacity estimation, APIs, databases, caching, queues, scaling and failure handling."
    },
    "Design Patterns": {
        overview: "Design patterns are reusable solutions to recurring software-design problems. They are most useful when they improve clarity and flexibility rather than adding unnecessary abstraction.",
        practical: "Use Strategy for interchangeable algorithms, Factory for object creation and Builder for readable construction of complex objects.",
        interview: "Explain intent, trade-offs and real use cases for Factory, Builder, Strategy, Observer and Adapter patterns."
    },
    OOP: {
        overview: "Object-oriented programming organizes behavior and state around objects. Good design uses encapsulation and polymorphism while preferring composition when inheritance is not a natural relationship.",
        practical: "Model a small library or payment system using interfaces, classes, encapsulated state and interchangeable implementations.",
        interview: "Know encapsulation, inheritance, polymorphism, abstraction, composition, interfaces and SOLID-related design decisions."
    },
    "Data Structures": {
        overview: "Data structures determine how data is stored and accessed. Choosing the right structure can turn an inefficient solution into an efficient one.",
        practical: "Compare array, linked list, stack, queue and tree implementations and record the time complexity of their common operations.",
        interview: "Be able to select structures based on access patterns and explain their time/space trade-offs."
    },
    Algorithms: {
        overview: "Algorithms are systematic procedures for solving computational problems. Interview preparation should emphasize correctness, complexity and choosing an approach from constraints.",
        practical: "Solve the same problem with a simple approach and an optimized approach, then compare their complexity and edge cases.",
        interview: "Review searching, sorting, recursion, greedy methods, dynamic programming and how to prove or reason about correctness."
    },
    Aptitude: {
        overview: "Aptitude practice develops numerical reasoning and speed for placement assessments. Accuracy comes first, followed by learning shortcuts that are mathematically justified.",
        practical: "Solve timed sets on percentages, ratios, averages, work, speed and probability, then review every incorrect answer.",
        interview: "Memorize useful formulas only after understanding them and practice translating word problems into equations quickly."
    },
    "Problem Solving": {
        overview: "Problem solving is the process of converting an unfamiliar question into smaller, testable steps. A strong approach makes assumptions explicit and handles edge cases before coding.",
        practical: "Write constraints, examples, brute force and optimized ideas before implementation, then test boundary inputs systematically.",
        interview: "Interviewers value a clear thought process: clarify, propose, analyze, implement, test and explain complexity."
    },
    "Computer Architecture": {
        overview: "Computer architecture explains how processors, memory and I/O cooperate to execute instructions. These concepts make performance and operating-system behavior easier to understand.",
        practical: "Trace a simple program through registers, cache and main memory and identify why cache locality affects performance.",
        interview: "Review CPU components, registers, cache levels, memory hierarchy, pipelining and basic instruction execution."
    },
    "Software Engineering": {
        overview: "Software engineering applies disciplined processes to build reliable software. Requirements, design, version control, testing and iterative delivery all contribute to maintainability.",
        practical: "Take a small project from requirements to design, Git workflow, testing and release while documenting key decisions.",
        interview: "Know SDLC concepts, requirements, design principles, code review, version control, testing and Agile practices."
    },
    Testing: {
        overview: "Software testing provides evidence that a system behaves as intended and helps prevent regressions. A professional test strategy uses different levels rather than relying on one test type.",
        practical: "Write unit tests for business logic, integration tests for persistence/API boundaries and regression tests for previously fixed bugs.",
        interview: "Understand unit vs integration vs end-to-end testing, test cases, mocks, regression and automation."
    },
    JUnit: {
        overview: "JUnit is a standard Java testing framework. Good tests are deterministic, focused, readable and independent of unrelated external state.",
        practical: "Write tests with @Test and assertions, use setup methods, parameterized tests and mocks where appropriate.",
        interview: "Review assertions, lifecycle methods, fixtures, parameterized tests, test naming and test isolation."
    },
    "CI/CD": {
        overview: "CI/CD automates building, testing and delivering software. Continuous integration catches integration problems early, while continuous delivery or deployment makes releases repeatable.",
        practical: "Create a pipeline that checks out code, installs dependencies, runs tests, builds an artifact and prepares a deployment.",
        interview: "Explain pipeline stages, artifacts, automated tests, environment promotion, rollback and deployment safety."
    },
    DevOps: {
        overview: "DevOps combines development and operations practices to improve delivery speed, reliability and observability. Automation and feedback loops are central themes.",
        practical: "Containerize an application, automate its tests and deployment, then add logs and health checks so failures are visible.",
        interview: "Connect Git, CI/CD, containers, infrastructure, monitoring and incident feedback into one delivery workflow."
    },
    "Tailwind CSS": {
        overview: "Tailwind CSS provides utility classes for composing interfaces directly in markup. Its strength is consistent design through a constrained utility system.",
        practical: "Build a responsive card or dashboard using spacing, typography, flex/grid and breakpoint utilities without writing custom CSS for every element.",
        interview: "Understand utility-first styling, responsive variants, composition, configuration and when custom CSS is still appropriate."
    },
    "Node.js": {
        overview: "Node.js runs JavaScript outside the browser using an event-driven, non-blocking I/O model. It is well suited to API servers and I/O-heavy applications.",
        practical: "Build an HTTP API, read environment variables, handle asynchronous database/file operations and return structured JSON responses.",
        interview: "Know the event loop, modules, npm, asynchronous I/O, streams, HTTP and how Node handles concurrent requests."
    },
    "Express.js": {
        overview: "Express.js is a lightweight Node.js web framework centered on routing and middleware. A clean application separates routes, controllers, services and error handling.",
        practical: "Create CRUD routes, validate request bodies, add authentication middleware and return consistent error responses.",
        interview: "Understand middleware order, routing, request/response objects, centralized errors, authentication and REST conventions."
    },
    "Next.js": {
        overview: "Next.js is a React framework that adds routing, server-side capabilities, data fetching and production optimizations. Modern Next.js applications often combine server and client components.",
        practical: "Create routed pages, fetch server-side data where appropriate and keep interactive browser-only logic in client components.",
        interview: "Review routing, server/client components, rendering strategies, data fetching, caching and performance optimization."
    },
    Bootstrap: {
        overview: "Bootstrap is a component and utility framework that accelerates responsive UI development. Its grid, forms, cards and utilities provide a consistent starting point.",
        practical: "Build a responsive dashboard using containers, rows, columns, cards and form utilities while keeping custom CSS limited to branding.",
        interview: "Know the grid system, breakpoints, containers, responsive utilities and how Bootstrap classes combine with custom styles."
    },
    "Web Development": {
        overview: "Web development combines frontend, backend, HTTP, databases and deployment into a complete application. Professional development requires understanding the boundaries between these layers.",
        practical: "Build a small full-stack feature from React UI to REST endpoint to database, then deploy it with environment-specific configuration.",
        interview: "Explain browser-to-server flow, APIs, authentication, database persistence, CORS, deployment and basic web security."
    },
    "Communication Skills": {
        overview: "Communication is a core professional skill for interviews and engineering teams. Clear structure is more valuable than using complicated vocabulary.",
        practical: "Practice explaining one project using Situation, Task, Action and Result, then answer technical questions with concise reasoning and examples.",
        interview: "Focus on structured answers, active listening, clarifying questions, confidence, project explanation and communicating trade-offs."
    }
};

const createDetailedTopicSection = (subject, topic, index) => {
    const action = [
        "Understand the definition, purpose and trade-offs before memorizing syntax.",
        "Relate the concept to a small real-world example from a project.",
        "Practice one implementation and check common edge cases.",
        "Compare it with at least one related concept and note when each is preferable.",
        "Prepare a short interview explanation that includes why the concept matters."
    ][index % 5];

    return `${index + 1}. ${topic}\n${topic} is an important part of ${subject}. Focus on what problem it solves, how it behaves in a real application and what trade-offs appear when it is used at scale. ${action}`;
};

const createSubjectNote = (subject, index) => {
    const topics = SUBJECT_NOTE_DETAILS[subject] || [
        "Fundamentals",
        "Core Concepts",
        "Practical Usage",
        "Best Practices",
        "Interview Questions"
    ];

    const profile = SUBJECT_NOTE_PROFILES[subject] || {
        overview: `${subject} is an important technical skill in a modern software-development learning path. Study the fundamentals first, then connect the concepts to practical projects, debugging and interview questions.`,
        practical: `Create a small hands-on exercise using ${subject}, observe the result, and document what you learned from the implementation and edge cases.`,
        interview: `Prepare concise definitions, practical examples, common mistakes, trade-offs and at least five interview questions related to ${subject}.`
    };

    const now = new Date();
    now.setDate(now.getDate() - Math.min(index, 30));
    const date = now.toISOString();

    const topicContent = topics
        .map((topic, topicIndex) => createDetailedTopicSection(subject, topic, topicIndex))
        .join("\n\n");

    return {
        id: `subject-note-${String(subject).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title: `${subject} — Detailed Revision Notes`,
        category: subject,
        tag: "AI Generated",
        description: `${subject} learning notes with core concepts, practical guidance, revision strategy and interview preparation.`,
        content: `${subject} — Detailed Learning Notes\n\nOVERVIEW\n${profile.overview}\n\nCORE CONCEPTS\n${topicContent}\n\nPRACTICAL APPLICATION\n${profile.practical}\n\nBEST PRACTICES\n• Start with the simplest correct approach before optimizing.\n• Use small examples to verify your understanding.\n• Test normal cases, boundary cases and failure cases.\n• Keep notes connected to the projects and roadmap where this skill is used.\n• Revise actively by explaining the concept without looking at the notes.\n\nINTERVIEW PREPARATION\n${profile.interview}\n\nQUICK REVISION CHECKLIST\n□ Can I define the main concepts in simple words?\n□ Can I give a practical project example?\n□ Can I explain one common mistake or trade-off?\n□ Can I solve a basic problem using this skill?\n□ Can I answer follow-up questions without memorizing a script?`,
        pinned: false,
        favorite: false,
        createdAt: date,
        updatedAt: date,
        isAutoGenerated: true,
        generatedBy: "AI Mentor"
    };
};

const isBuiltInNote = (note) => {
    const builtInIds = new Set([1, 2, 3, 4, 5, 6]);
    return builtInIds.has(note?.id);
};

const ensureNotesForSubjects = (existingNotes, subjects) => {
    const result = Array.isArray(existingNotes) ? [...existingNotes] : [];
    const subjectMap = new Map();

    result.forEach((note) => {
        const key = normalizeSkillKey(note?.category);
        if (key) subjectMap.set(key, note);
    });

    (subjects || []).forEach((subject, index) => {
        const name = String(subject || "").trim();
        const key = normalizeSkillKey(name);
        if (!name || !key) return;

        const existing = subjectMap.get(key);

        // No note exists for this skill -> create a complete AI Mentor note.
        if (!existing) {
            const generated = createSubjectNote(name, index);
            result.push(generated);
            subjectMap.set(key, generated);
            return;
        }

        /*
         * Migrate old short notes. The first six notes shipped with the old
         * Notes page were built-in notes, not user-created notes, so they are
         * also upgraded. Any other manually-created note is preserved.
         */
        const oldShortNote = String(existing.content || "").trim().length < 1000;
        const shouldUpgrade = Boolean(existing.isAutoGenerated) || isBuiltInNote(existing);

        if (shouldUpgrade && oldShortNote) {
            const upgraded = createSubjectNote(name, index);
            const merged = {
                ...upgraded,
                id: existing.id,
                pinned: Boolean(existing.pinned),
                favorite: Boolean(existing.favorite),
                createdAt: existing.createdAt || upgraded.createdAt,
                updatedAt: upgraded.updatedAt
            };

            const position = result.findIndex((note) => note.id === existing.id);
            if (position >= 0) result[position] = merged;
            subjectMap.set(key, merged);
        }
    });

    return result;
};

export default function Notes() {

    const [notes, setNotes] = useState(loadNotes);

    const [search, setSearch] = useState("");

    const [activeCategory, setActiveCategory] =
        useState("All");

    const [activeView, setActiveView] =
        useState("all");

    const [selectedNote, setSelectedNote] =
        useState(null);

    const [isEditorOpen, setIsEditorOpen] =
        useState(false);

    const [editingNote, setEditingNote] =
        useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] =
        useState(null);

    const [sortBy, setSortBy] =
        useState("updated");

    const [toast, setToast] =
        useState("");

    /* =====================================================
       MASTER SUBJECTS
       ===================================================== */

    const [masterSkills, setMasterSkills] =
        useState(FALLBACK_MASTER_SUBJECTS);

    const [skillsLoading, setSkillsLoading] =
        useState(true);

    const [skillsError, setSkillsError] =
        useState("");

    const [form, setForm] = useState({
        title: "",
        category: "Java",
        tag: "",
        description: "",
        content: "",
        pinned: false,
        favorite: false
    });

    /* =====================================================
       LOAD MASTER SKILLS
       =====================================================

       This keeps the Notes Subjects rail synchronized with the same
       backend skill catalog used elsewhere in the application.
       A failure never breaks the Notes page; the local fallback remains
       available so the UI stays usable even while the backend is down.
    ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadMasterSkills = async () => {
            setSkillsLoading(true);
            setSkillsError("");

            try {
                let response;

                try {
                    response = await API.get("/api/skills");
                } catch (firstError) {
                    console.info(
                        "\n/api/skills failed; trying /api/skills/all",
                        firstError?.response?.status
                    );

                    response = await API.get("/api/skills/all");
                }

                const extracted = uniqueSkillNames(
                    collectSkillNames(response?.data)
                );

                if (!cancelled && extracted.length > 0) {
                    setMasterSkills(extracted);
                }

                if (!cancelled && extracted.length === 0) {
                    setSkillsError(
                        "The skill API returned no subjects. Showing the local catalog."
                    );
                    setMasterSkills(FALLBACK_MASTER_SUBJECTS);
                }
            } catch (error) {
                console.warn(
                    "Unable to load master skill catalog for Notes:",
                    error
                );

                if (!cancelled) {
                    setSkillsError(
                        "Skill catalog is offline. Showing the local catalog."
                    );
                    setMasterSkills(FALLBACK_MASTER_SUBJECTS);
                }
            } finally {
                if (!cancelled) {
                    setSkillsLoading(false);
                }
            }
        };

        loadMasterSkills();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =====================================================
       CREATE A NOTE FOR EVERY SUBJECT
       ===================================================== */

    useEffect(() => {
        /*
         * IMPORTANT: masterSkills starts with the local 55-skill catalog.
         * Therefore this effect must NOT depend on masterSkills being
         * initially empty. It must always reconcile the notes collection
         * against the current master skill list.
         *
         * Result: every skill gets a note automatically, while existing
         * manually-created notes are preserved.
         */
        if (!Array.isArray(masterSkills) || masterSkills.length === 0) {
            return;
        }

        setNotes((previous) => {
            const reconciled = ensureNotesForSubjects(
                previous,
                masterSkills
            );

            return reconciled;
        });
    }, [masterSkills]);

    /* =====================================================
       SAVE NOTES
    ===================================================== */

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(notes)
            );
        } catch (error) {
            console.warn("Unable to save notes:", error);
        }
    }, [notes]);

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (message) => {
        setToast(message);

        window.setTimeout(() => {
            setToast("");
        }, 2200);
    };

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories = useMemo(() => {

        /*
         * Start with the master skill catalog so every skill is visible
         * even when there is currently no note for that subject. Then
         * append custom categories that may have been created manually
         * in older/local notes.
         */
        return uniqueSkillNames([
            ...masterSkills,
            ...notes
                .map((note) => note.category)
                .filter(Boolean)
        ]);

    }, [masterSkills, notes]);

    /* =====================================================
       FILTERED NOTES
    ===================================================== */

    const filteredNotes = useMemo(() => {

        const query =
            search.trim().toLowerCase();

        let result = notes.filter((note) => {

            const matchesSearch =
                !query ||
                note.title
                    ?.toLowerCase()
                    .includes(query) ||
                note.category
                    ?.toLowerCase()
                    .includes(query) ||
                note.tag
                    ?.toLowerCase()
                    .includes(query) ||
                note.description
                    ?.toLowerCase()
                    .includes(query) ||
                note.content
                    ?.toLowerCase()
                    .includes(query);

            const matchesCategory =
                activeCategory === "All" ||
                note.category === activeCategory;

            let matchesView = true;

            if (activeView === "pinned") {
                matchesView = note.pinned;
            }

            if (activeView === "favorites") {
                matchesView = note.favorite;
            }

            return (
                matchesSearch &&
                matchesCategory &&
                matchesView
            );
        });

        result = [...result].sort((a, b) => {

            if (sortBy === "title") {
                return a.title.localeCompare(b.title);
            }

            if (sortBy === "created") {
                return (
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
                );
            }

            return (
                new Date(b.updatedAt) -
                new Date(a.updatedAt)
            );
        });

        return result;

    }, [
        notes,
        search,
        activeCategory,
        activeView,
        sortBy
    ]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const stats = useMemo(() => {

        return {
            total: notes.length,

            pinned: notes.filter(
                (note) => note.pinned
            ).length,

            favorites: notes.filter(
                (note) => note.favorite
            ).length,

            categories: categories.length
        };

    }, [notes, categories]);

    /* =====================================================
       OPEN CREATE MODAL
    ===================================================== */

    const openCreateNote = () => {

        setEditingNote(null);

        setForm({
            title: "",
            category:
                categories[0] ||
                "Java",
            tag: "",
            description: "",
            content: "",
            pinned: false,
            favorite: false
        });

        setIsEditorOpen(true);
    };

    /* =====================================================
       OPEN EDIT MODAL
    ===================================================== */

    const openEditNote = (note) => {

        setEditingNote(note);

        setForm({
            title: note.title || "",
            category: note.category || "Java",
            tag: note.tag || "",
            description: note.description || "",
            content: note.content || "",
            pinned: Boolean(note.pinned),
            favorite: Boolean(note.favorite)
        });

        setSelectedNote(null);

        setIsEditorOpen(true);
    };

    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleFormChange = (event) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };

    /* =====================================================
       SAVE NOTE
    ===================================================== */

    const handleSaveNote = (event) => {

        event.preventDefault();

        if (!form.title.trim()) {
            showToast("Please enter a note title.");
            return;
        }

        if (!form.content.trim()) {
            showToast("Please add some note content.");
            return;
        }

        const now =
            new Date().toISOString();

        if (editingNote) {

            setNotes((previous) =>
                previous.map((note) =>
                    note.id === editingNote.id
                        ? {
                            ...note,
                            ...form,
                            title:
                                form.title.trim(),
                            description:
                                form.description.trim(),
                            content:
                                form.content,
                            updatedAt: now
                        }
                        : note
                )
            );

            showToast("Note updated successfully.");

        } else {

            const newNote = {
                id: Date.now(),
                ...form,
                title: form.title.trim(),
                description:
                    form.description.trim(),
                content: form.content,
                createdAt: now,
                updatedAt: now
            };

            setNotes((previous) => [
                newNote,
                ...previous
            ]);

            showToast("New note created.");
        }

        setIsEditorOpen(false);
        setEditingNote(null);
    };

    /* =====================================================
       DELETE NOTE
    ===================================================== */

    const handleDeleteNote = (id) => {

        setNotes((previous) =>
            previous.filter(
                (note) => note.id !== id
            )
        );

        if (
            selectedNote &&
            selectedNote.id === id
        ) {
            setSelectedNote(null);
        }

        setShowDeleteConfirm(null);

        showToast("Note deleted.");
    };

    /* =====================================================
       TOGGLE PIN
    ===================================================== */

    const togglePin = (id) => {

        setNotes((previous) =>
            previous.map((note) =>
                note.id === id
                    ? {
                        ...note,
                        pinned: !note.pinned,
                        updatedAt:
                            new Date().toISOString()
                    }
                    : note
            )
        );

        showToast("Pin status updated.");
    };

    /* =====================================================
       TOGGLE FAVORITE
    ===================================================== */

    const toggleFavorite = (id) => {

        setNotes((previous) =>
            previous.map((note) =>
                note.id === id
                    ? {
                        ...note,
                        favorite: !note.favorite,
                        updatedAt:
                            new Date().toISOString()
                    }
                    : note
            )
        );

        showToast("Favorite status updated.");
    };

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    const resetFilters = () => {

        setSearch("");
        setActiveCategory("All");
        setActiveView("all");
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="notes-page">

            <div className="notes-container">

                {/* =================================================
                   HEADER
                ================================================= */}

                <header className="notes-hero">

                    <div className="notes-hero-content">

                        <div className="notes-hero-icon">
                            <i className="bi bi-journal-richtext"></i>
                        </div>

                        <div>

                            <span className="notes-eyebrow">
                                <i className="bi bi-stars"></i>
                                PERSONAL LEARNING SPACE
                            </span>

                            <h1>
                                My Notes
                            </h1>

                            <p>
                                Organize your knowledge,
                                revise important concepts and
                                keep your learning journey in one place.
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="notes-create-btn"
                        onClick={openCreateNote}
                    >
                        <i className="bi bi-plus-lg"></i>
                        New Note
                    </button>

                </header>


                {/* =================================================
                   STATISTICS
                ================================================= */}

                <section className="notes-stat-grid">

                    <div className="notes-stat-card">

                        <div className="notes-stat-icon purple">
                            <i className="bi bi-journal-text"></i>
                        </div>

                        <div>
                            <span>Total Notes</span>
                            <strong>{stats.total}</strong>
                            <small>Your knowledge base</small>
                        </div>

                    </div>

                    <div className="notes-stat-card">

                        <div className="notes-stat-icon orange">
                            <i className="bi bi-pin-angle-fill"></i>
                        </div>

                        <div>
                            <span>Pinned</span>
                            <strong>{stats.pinned}</strong>
                            <small>Quick access notes</small>
                        </div>

                    </div>

                    <div className="notes-stat-card">

                        <div className="notes-stat-icon pink">
                            <i className="bi bi-heart-fill"></i>
                        </div>

                        <div>
                            <span>Favorites</span>
                            <strong>{stats.favorites}</strong>
                            <small>Important concepts</small>
                        </div>

                    </div>

                    <div className="notes-stat-card">

                        <div className="notes-stat-icon blue">
                            <i className="bi bi-collection-fill"></i>
                        </div>

                        <div>
                            <span>Subjects</span>
                            <strong>{stats.categories}</strong>
                            <small>Learning categories</small>
                        </div>

                    </div>

                </section>


                {/* =================================================
                   MAIN CONTENT
                ================================================= */}

                <div className="notes-main-layout">

                    {/* =================================================
                       SIDEBAR
                    ================================================= */}

                    <aside className="notes-filter-sidebar">

                        <div className="notes-sidebar-title">
                            <span>YOUR NOTES</span>
                            <i className="bi bi-sliders2"></i>
                        </div>

                        <nav className="notes-view-nav">

                            <button
                                type="button"
                                className={
                                    activeView === "all"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveView("all")
                                }
                            >
                                <span>
                                    <i className="bi bi-grid-1x2-fill"></i>
                                    All Notes
                                </span>

                                <b>{stats.total}</b>
                            </button>

                            <button
                                type="button"
                                className={
                                    activeView === "pinned"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveView("pinned")
                                }
                            >
                                <span>
                                    <i className="bi bi-pin-angle-fill"></i>
                                    Pinned
                                </span>

                                <b>{stats.pinned}</b>
                            </button>

                            <button
                                type="button"
                                className={
                                    activeView === "favorites"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveView("favorites")
                                }
                            >
                                <span>
                                    <i className="bi bi-heart-fill"></i>
                                    Favorites
                                </span>

                                <b>{stats.favorites}</b>
                            </button>

                        </nav>

                        <div className="notes-sidebar-section">

                            <div className="notes-sidebar-section-head">
                                <span>SUBJECTS</span>
                                <span>
                                    {skillsLoading
                                        ? "..."
                                        : categories.length}
                                </span>
                            </div>

                            {skillsError && (
                                <div className="notes-skill-sync-status" title={skillsError}>
                                    <i className="bi bi-cloud-slash"></i>
                                    <span>Local subject catalog</span>
                                </div>
                            )}

                            <button
                                type="button"
                                className={
                                    activeCategory === "All"
                                        ? "subject-item active"
                                        : "subject-item"
                                }
                                onClick={() =>
                                    setActiveCategory("All")
                                }
                            >
                                <span>
                                    <i className="bi bi-collection"></i>
                                    All Subjects
                                </span>
                            </button>

                            {categories.map((category) => (

                                <button
                                    type="button"
                                    className={
                                        activeCategory === category
                                            ? "subject-item active"
                                            : "subject-item"
                                    }
                                    key={category}
                                    onClick={() =>
                                        setActiveCategory(category)
                                    }
                                >
                                    <span>
                                        <i
                                            className={
                                                `bi ${getCategoryIcon(category)}`
                                            }
                                        ></i>

                                        {category}
                                    </span>

                                    <small>
                                        {
                                            notes.filter(
                                                (note) =>
                                                    note.category ===
                                                    category
                                            ).length
                                        }
                                    </small>

                                </button>

                            ))}

                        </div>

                        <div className="notes-sidebar-tip">

                            <div className="notes-sidebar-tip-icon">
                                <i className="bi bi-lightbulb-fill"></i>
                            </div>

                            <div>
                                <strong>
                                    Study smarter
                                </strong>

                                <p>
                                    Pin important notes so
                                    you can revise them quickly.
                                </p>
                            </div>

                        </div>

                    </aside>


                    {/* =================================================
                       NOTES CONTENT
                    ================================================= */}

                    <main className="notes-content">

                        {/* SEARCH BAR */}

                        <div className="notes-toolbar">

                            <div className="notes-search">

                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search notes, subjects, concepts..."
                                />

                                {search && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                        title="Clear search"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>

                                )}

                            </div>

                            <div className="notes-toolbar-right">

                                <span className="notes-result-count">
                                    {filteredNotes.length}
                                    {" "}
                                    {filteredNotes.length === 1
                                        ? "note"
                                        : "notes"}
                                </span>

                                <select
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(
                                            event.target.value
                                        )
                                    }
                                    className="notes-sort-select"
                                >
                                    <option value="updated">
                                        Recently Updated
                                    </option>

                                    <option value="created">
                                        Recently Created
                                    </option>

                                    <option value="title">
                                        Title A-Z
                                    </option>
                                </select>

                            </div>

                        </div>


                        {/* ACTIVE FILTERS */}

                        {(search ||
                            activeCategory !== "All" ||
                            activeView !== "all") && (

                            <div className="notes-active-filters">

                                <span>
                                    Active filters:
                                </span>

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                    >
                                        Search: "{search}"
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}

                                {activeCategory !== "All" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveCategory("All")
                                        }
                                    >
                                        {activeCategory}
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}

                                {activeView !== "all" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveView("all")
                                        }
                                    >
                                        {activeView === "pinned"
                                            ? "Pinned"
                                            : "Favorites"}
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="clear-all-filters"
                                    onClick={resetFilters}
                                >
                                    Clear all
                                </button>

                            </div>

                        )}


                        {/* NOTES HEADER */}

                        <div className="notes-section-header">

                            <div>

                                <span>
                                    {activeCategory === "All"
                                        ? "YOUR KNOWLEDGE BASE"
                                        : activeCategory.toUpperCase()}
                                </span>

                                <h2>
                                    {activeView === "pinned"
                                        ? "Pinned Notes"
                                        : activeView === "favorites"
                                            ? "Favorite Notes"
                                            : "All Notes"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={openCreateNote}
                                className="notes-inline-create"
                            >
                                <i className="bi bi-plus-lg"></i>
                                Add Note
                            </button>

                        </div>


                        {/* NOTES GRID */}

                        {filteredNotes.length > 0 ? (

                            <div className="notes-grid">

                                {filteredNotes.map((note) => (

                                    <article
                                        className="note-card"
                                        key={note.id}
                                    >

                                        <div className="note-card-top">

                                            <div
                                                className={
                                                    `note-category-icon ${getCategoryClass(note.category)}`
                                                }
                                            >
                                                <i
                                                    className={
                                                        `bi ${getCategoryIcon(note.category)}`
                                                    }
                                                ></i>
                                            </div>

                                            <div className="note-card-actions">

                                                <button
                                                    type="button"
                                                    className={
                                                        note.pinned
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        togglePin(
                                                            note.id
                                                        )
                                                    }
                                                    title={
                                                        note.pinned
                                                            ? "Unpin"
                                                            : "Pin"
                                                    }
                                                >
                                                    <i
                                                        className={
                                                            note.pinned
                                                                ? "bi bi-pin-angle-fill"
                                                                : "bi bi-pin-angle"
                                                        }
                                                    ></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        note.favorite
                                                            ? "active favorite"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        toggleFavorite(
                                                            note.id
                                                        )
                                                    }
                                                    title={
                                                        note.favorite
                                                            ? "Remove favorite"
                                                            : "Add favorite"
                                                    }
                                                >
                                                    <i
                                                        className={
                                                            note.favorite
                                                                ? "bi bi-heart-fill"
                                                                : "bi bi-heart"
                                                        }
                                                    ></i>
                                                </button>

                                            </div>

                                        </div>


                                        <div className="note-card-body">

                                            <div className="note-meta">

                                                <span>
                                                    {note.category}
                                                </span>

                                                {note.tag && (
                                                    <>
                                                        <i className="bi bi-dot"></i>
                                                        <span>
                                                            {note.tag}
                                                        </span>
                                                    </>
                                                )}

                                            </div>

                                            <h3>
                                                {note.title}
                                            </h3>

                                            <p>
                                                {note.description ||
                                                    "No description added for this note."}
                                            </p>

                                            <div className="note-preview">
                                                {note.content}
                                            </div>

                                        </div>


                                        <div className="note-card-footer">

                                            <span className="note-updated">

                                                <i className="bi bi-clock"></i>

                                                Updated{" "}
                                                {formatShortDate(
                                                    note.updatedAt
                                                )}

                                            </span>

                                            <div className="note-footer-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedNote(
                                                            note
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-eye"></i>
                                                    Open
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditNote(
                                                            note
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete"
                                                    onClick={() =>
                                                        setShowDeleteConfirm(
                                                            note.id
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>

                                            </div>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        ) : (

                            <div className="notes-empty-state">

                                <div className="notes-empty-icon">
                                    <i className="bi bi-journal-x"></i>
                                </div>

                                <h3>
                                    No notes found
                                </h3>

                                <p>
                                    We couldn't find any notes
                                    matching your current filters.
                                </p>

                                <div className="notes-empty-actions">

                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                    >
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                        Reset Filters
                                    </button>

                                    <button
                                        type="button"
                                        onClick={openCreateNote}
                                    >
                                        <i className="bi bi-plus-lg"></i>
                                        Create Note
                                    </button>

                                </div>

                            </div>

                        )}

                    </main>

                </div>

            </div>


            {/* =====================================================
               NOTE VIEW MODAL
            ===================================================== */}

            {selectedNote && (

                <div
                    className="notes-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSelectedNote(null);
                        }

                    }}
                >

                    <div className="note-view-modal">

                        <div className="note-view-header">

                            <div className="note-view-title">

                                <div
                                    className={
                                        `note-view-icon ${getCategoryClass(selectedNote.category)}`
                                    }
                                >
                                    <i
                                        className={
                                            `bi ${getCategoryIcon(selectedNote.category)}`
                                        }
                                    ></i>
                                </div>

                                <div>

                                    <span>
                                        {selectedNote.category}
                                        {selectedNote.tag
                                            ? ` • ${selectedNote.tag}`
                                            : ""}
                                    </span>

                                    <h2>
                                        {selectedNote.title}
                                    </h2>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="note-modal-close"
                                onClick={() =>
                                    setSelectedNote(null)
                                }
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>


                        <div className="note-view-meta">

                            <span>
                                <i className="bi bi-calendar3"></i>
                                Created{" "}
                                {formatDate(
                                    selectedNote.createdAt
                                )}
                            </span>

                            <span>
                                <i className="bi bi-clock-history"></i>
                                Updated{" "}
                                {formatDate(
                                    selectedNote.updatedAt
                                )}
                            </span>

                            {selectedNote.pinned && (
                                <span className="modal-badge">
                                    <i className="bi bi-pin-angle-fill"></i>
                                    Pinned
                                </span>
                            )}

                            {selectedNote.favorite && (
                                <span className="modal-badge favorite">
                                    <i className="bi bi-heart-fill"></i>
                                    Favorite
                                </span>
                            )}

                        </div>


                        {selectedNote.description && (

                            <div className="note-view-description">
                                {selectedNote.description}
                            </div>

                        )}


                        <div className="note-view-content">

                            {selectedNote.content
                                .split("\n")
                                .map((line, index) => (

                                    <p
                                        key={index}
                                        className={
                                            line.trim() === ""
                                                ? "empty-line"
                                                : ""
                                        }
                                    >
                                        {line || "\u00A0"}
                                    </p>

                                ))}

                        </div>


                        <div className="note-view-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    openEditNote(
                                        selectedNote
                                    )
                                }
                            >
                                <i className="bi bi-pencil"></i>
                                Edit Note
                            </button>

                            <button
                                type="button"
                                className="primary"
                                onClick={() =>
                                    setSelectedNote(null)
                                }
                            >
                                Done
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
               CREATE / EDIT MODAL
            ===================================================== */}

            {isEditorOpen && (

                <div
                    className="notes-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setIsEditorOpen(false);
                        }

                    }}
                >

                    <form
                        className="note-editor-modal"
                        onSubmit={handleSaveNote}
                    >

                        <div className="note-editor-header">

                            <div>

                                <span>
                                    {editingNote
                                        ? "EDIT NOTE"
                                        : "CREATE NOTE"}
                                </span>

                                <h2>
                                    {editingNote
                                        ? "Update your note"
                                        : "Capture something worth remembering"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="note-modal-close"
                                onClick={() =>
                                    setIsEditorOpen(false)
                                }
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>


                        <div className="note-form-grid">

                            <div className="note-form-group full">

                                <label>
                                    Note Title
                                </label>

                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Java OOPs Interview Notes"
                                    autoFocus
                                />

                            </div>


                            <div className="note-form-group">

                                <label>
                                    Subject
                                </label>

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleFormChange}
                                >

                                    {categories.map((category) => (

                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            <div className="note-form-group">

                                <label>
                                    Tag
                                </label>

                                <input
                                    name="tag"
                                    value={form.tag}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Interview"
                                />

                            </div>


                            <div className="note-form-group full">

                                <label>
                                    Short Description
                                </label>

                                <input
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    placeholder="Add a short description..."
                                />

                            </div>


                            <div className="note-form-group full">

                                <label>
                                    Note Content
                                </label>

                                <textarea
                                    name="content"
                                    value={form.content}
                                    onChange={handleFormChange}
                                    placeholder="Write your notes here..."
                                    rows="13"
                                />

                            </div>


                            <div className="note-form-options full">

                                <label className="note-checkbox">

                                    <input
                                        type="checkbox"
                                        name="pinned"
                                        checked={form.pinned}
                                        onChange={handleFormChange}
                                    />

                                    <span>
                                        <i className="bi bi-pin-angle-fill"></i>
                                        Pin this note
                                    </span>

                                </label>

                                <label className="note-checkbox">

                                    <input
                                        type="checkbox"
                                        name="favorite"
                                        checked={form.favorite}
                                        onChange={handleFormChange}
                                    />

                                    <span>
                                        <i className="bi bi-heart-fill"></i>
                                        Add to favorites
                                    </span>

                                </label>

                            </div>

                        </div>


                        <div className="note-editor-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    setIsEditorOpen(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary"
                            >
                                <i
                                    className={
                                        editingNote
                                            ? "bi bi-check-lg"
                                            : "bi bi-plus-lg"
                                    }
                                ></i>

                                {editingNote
                                    ? "Save Changes"
                                    : "Create Note"}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* =====================================================
               DELETE CONFIRMATION
            ===================================================== */}

            {showDeleteConfirm && (

                <div className="notes-modal-overlay">

                    <div className="delete-confirm-modal">

                        <div className="delete-confirm-icon">
                            <i className="bi bi-trash3-fill"></i>
                        </div>

                        <h3>
                            Delete this note?
                        </h3>

                        <p>
                            This action will permanently remove
                            the note from your workspace.
                        </p>

                        <div className="delete-confirm-actions">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDeleteConfirm(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                    handleDeleteNote(
                                        showDeleteConfirm
                                    )
                                }
                            >
                                Delete Note
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
               TOAST
            ===================================================== */}

            {toast && (

                <div className="notes-toast">

                    <i className="bi bi-check-circle-fill"></i>

                    <span>
                        {toast}
                    </span>

                </div>

            )}

        </div>
    );
}

/* ========================================================================
   NOTES SUBJECT CATALOG — IMPLEMENTATION NOTES
   ========================================================================

   The following design decisions are deliberately kept in this component:

   01. The Notes page owns note persistence.
       Notes continue to use the existing localStorage key and existing
       CRUD behavior. No existing saved note is discarded by the subject
       synchronization layer.

   02. The Skills API owns the master subject catalog.
       The page requests /api/skills first and /api/skills/all as a fallback.
       This mirrors the endpoint strategy already used by the learning
       resources experience and keeps the two pages aligned.

   03. A subject does not require an existing note.
       This is the important behavior for a real learning dashboard: a
       student may have 55 skills while only having notes for six of them.
       The Subjects rail therefore shows all master skills and displays a
       zero count for a skill that has no note yet. Clicking that subject
       correctly activates the existing filtered empty state.

   04. Custom legacy note categories are retained.
       If an older locally saved note uses a category that is not present
       in the current master catalog, that category is appended rather than
       silently removed. This avoids data loss and makes the migration safe.

   05. Skill names are normalized only for deduplication.
       The display value returned by the API is preserved, while case,
       punctuation and repeated whitespace are normalized internally so
       values such as React, react, and React.js do not create duplicate
       Subjects entries.

   06. The visual language of the page is intentionally unchanged.
       No global selectors were added. No body, html, sidebar, navbar, or
       application-shell styles are modified here. Existing Notes.css class
       names remain the same so the page continues to sit safely inside the
       application's existing sidebar layout.

   07. API failure is non-blocking.
       If the backend is temporarily unavailable, the Notes experience still
       renders immediately with the local catalog. Once the backend becomes
       available again, a normal page refresh re-synchronizes the catalog.

   08. Form categories use the same catalog as the Subjects rail.
       This prevents a mismatch where a skill can be selected in the sidebar
       but cannot be assigned to a newly created note.

   09. Filtering remains local and fast.
       Notes are not re-requested from the backend when a subject is clicked.
       The existing in-memory filtering is retained, which means selecting
       any of the 55 subjects is instant and does not create unnecessary API
       traffic.

   10. Counts remain note counts, not skill counts.
       The number shown beside an individual subject is the number of saved
       notes belonging to that subject. The total Subjects value is the
       number of unique subjects available from the master catalog plus any
       legacy custom note categories.

   11. This separation is intentional for the personalized mentor flow.
       Skills describe what the learner knows or is learning. Notes describe
       what the learner has personally captured. Those are different data
       concepts and should not be coupled by requiring one note per skill.

   12. Existing UI interactions remain intact.
       Search, sorting, pinned notes, favorites, create, edit, delete, note
       preview, note modal, toast notifications, and local persistence all
       continue to use the same state and class structure.

   13. The page is therefore compatible with the existing dashboard shell.
       The Notes component remains responsible only for content inside its
       route. The application-level sidebar is not touched by this change.

   14. Future backend synchronization can be added without redesigning the
       UI. A future implementation can replace localStorage persistence with
       a Notes API while retaining the exact same Subjects filtering model.

   15. The fallback catalog is a resilience mechanism, not the primary data
       source. In production, the backend skill catalog should be available,
       and the UI will automatically use the backend response.

   16. The component remains intentionally self-contained. No new package,
       CSS framework, router dependency, icon package, or state-management
       library is required by this subject synchronization feature.

   17. The existing Bootstrap Icons convention is preserved. The dynamic
       category icon helper still resolves known skills to familiar icons and
       safely falls back to the journal icon for newly introduced skills.

   18. The feature is safe for future skill additions. If the backend adds
       a new skill tomorrow, it can appear in Notes without editing this JSX,
       provided the API returns the skill through /api/skills.

   19. The result is a proper learning workspace rather than a static notes
       mockup: the Subjects rail represents the learner's complete skill
       universe, while the cards represent the notes actually created.

   20. No UI redesign is required to use this behavior.
       The existing Notes.css continues to control spacing, typography,
       colors, cards, modal appearance, responsive behavior, and sidebar-safe
       layout.
   ======================================================================== */

