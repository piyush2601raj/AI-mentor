package com.aimentor.service;

import com.aimentor.entity.InterviewQuestion;
import com.aimentor.repository.InterviewQuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class InterviewQuestionSeeder implements CommandLineRunner {
    private final InterviewQuestionRepository repo;
    public InterviewQuestionSeeder(InterviewQuestionRepository repo){this.repo=repo;}
    @Override public void run(String... args){
        List<InterviewQuestion> qs = List.of(
            q("SOFTWARE_DEVELOPER","Java","Easy","Which keyword is used to inherit a class in Java?","extends","implements","inherits","super","A","A class extends another class. Interfaces are implemented using implements."),
            q("SOFTWARE_DEVELOPER","Java","Medium","Which collection does not allow duplicate elements?","List","Set","Queue","Map","B","Set implementations do not allow duplicate elements."),
            q("SOFTWARE_DEVELOPER","Java","Medium","What is method overloading?","Same method name with different parameters","Same parameters in child class","Changing only return type","Making a method private","A","Overloading means same method name with a different parameter list."),
            q("SOFTWARE_DEVELOPER","Spring Boot","Easy","Which annotation marks a Spring REST controller?","@Entity","@RestController","@Repository","@Autowired","B","@RestController combines controller semantics with response-body serialization."),
            q("SOFTWARE_DEVELOPER","Spring Boot","Medium","What does dependency injection primarily provide?","Manual object creation","Automatic dependency provisioning","Database indexing","HTTP compression","B","Spring manages and injects configured dependencies into components."),
            q("SOFTWARE_DEVELOPER","Spring Boot","Hard","Which layer normally contains business rules in a layered Spring application?","Controller","Service","Repository","DTO","B","The service layer is the conventional location for business logic."),
            q("SOFTWARE_DEVELOPER","SQL","Easy","Which SQL clause filters rows before grouping?","HAVING","WHERE","ORDER BY","LIMIT","B","WHERE filters rows before GROUP BY; HAVING filters groups."),
            q("SOFTWARE_DEVELOPER","SQL","Medium","Which JOIN returns all rows from the left table?","INNER JOIN","RIGHT JOIN","LEFT JOIN","CROSS JOIN","C","LEFT JOIN preserves all rows from the left table."),
            q("SOFTWARE_DEVELOPER","React","Easy","Which hook is commonly used for component state?","useRoute","useState","useServer","useClass","B","useState is React's standard hook for local component state."),
            q("SOFTWARE_DEVELOPER","React","Medium","Why is a key prop used when rendering lists?","For CSS","To help React identify list items","For API security","To create routes","B","Keys help React reconcile list items efficiently and correctly."),
            q("SOFTWARE_DEVELOPER","DSA","Easy","What is the average time complexity of binary search on a sorted array?","O(n)","O(log n)","O(n log n)","O(1)","B","Binary search halves the search interval at each step."),
            q("SOFTWARE_DEVELOPER","OOP","Easy","Which OOP concept hides implementation details?","Inheritance","Encapsulation","Recursion","Compilation","B","Encapsulation bundles data and behavior while controlling access to implementation details."),
            q("SOFTWARE_DEVELOPER","Spring Security","Medium","What is authentication concerned with?","What a user can access","Who the user is","Database normalization","Caching","B","Authentication verifies identity; authorization determines permissions."),
            q("SOFTWARE_DEVELOPER","JPA / Hibernate","Medium","What is the purpose of @Entity?","Marks a class for persistence mapping","Starts a server","Creates a REST endpoint","Enables React","A","@Entity tells JPA that the class is a persistent entity."),
            q("SOFTWARE_DEVELOPER","REST API","Easy","Which HTTP method is commonly used to create a resource?","GET","POST","DELETE","HEAD","B","POST is commonly used to create a new resource."),
            q("DATA_SCIENTIST","Python","Easy","Which Python library is widely used for tabular data analysis?","NumPy","Pandas","Flask","Requests","B","Pandas provides DataFrame and Series structures for tabular data analysis."),
            q("DATA_SCIENTIST","Machine Learning","Easy","What is supervised learning trained with?","Labeled data","Only random data","No examples","Only images","A","Supervised learning uses labeled examples to learn a mapping."),
            q("FRONTEND_DEVELOPER","React","Easy","Which hook is used for local component state?","useState","useApi","useDom","useRoute","A","useState is used to add local state to a function component."),
            q("BACKEND_DEVELOPER","REST API","Easy","Which HTTP status usually means a successful request?","404","500","200","401","C","200 OK indicates a successful request."),
            q("DEVOPS_ENGINEER","Docker","Easy","What is a Docker image?","A running process","A packaged blueprint for a container","A database","A network cable","B","A Docker image contains the filesystem and metadata needed to create containers.")
        );
        for (InterviewQuestion q : qs) if (!repo.existsByCareerGoalAndQuestion(q.getCareerGoal(), q.getQuestion())) repo.save(q);
    }
    private InterviewQuestion q(String g,String t,String d,String q,String a,String b,String c,String e,String correct,String exp){return new InterviewQuestion(g,t,d,q,a,b,c,e,correct,exp);}
}
