package com.aimentor.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * One-time production-safe resource catalog seeder.
 *
 * Run with:
 *   --spring.profiles.active=resource-seed
 *
 * The SQL is idempotent: it checks skill + resource type before inserting.
 */
@Component
@Profile("resource-seed")
public class ResourceCatalogSeeder implements CommandLineRunner {

    private final DataSource dataSource;

    public ResourceCatalogSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        ResourceDatabasePopulator populator =
                new ResourceDatabasePopulator();

        populator.setContinueOnError(false);
        populator.addScript(
                new ClassPathResource("db/resources_55x3_seed.sql")
        );

        populator.execute(dataSource);

        System.out.println(
                "================================================="
        );
        System.out.println(
                " Resource catalog seed completed successfully."
        );
        System.out.println(
                " Target: 55 skills × 3 resource types = 165"
        );
        System.out.println(
                "================================================="
        );
    }
}
