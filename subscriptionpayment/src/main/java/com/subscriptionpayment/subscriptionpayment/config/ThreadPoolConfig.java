package com.subscriptionpayment.subscriptionpayment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
@EnableScheduling
public class ThreadPoolConfig {

    // ── Primary pool properties ──────────────────────────────────────
    @Value("${thread.pool.core-size:10}")      private int    corePoolSize;
    @Value("${thread.pool.max-size:50}")       private int    maxPoolSize;
    @Value("${thread.pool.queue-capacity:200}")private int    queueCapacity;
    @Value("${thread.pool.keep-alive:60}")     private int    keepAlive;
    @Value("${thread.pool.name-prefix:SubAsync-}") private String namePrefix;

    // ── Batch pool properties ────────────────────────────────────────
    @Value("${batch.thread.pool.core-size:5}")  private int    batchCoreSize;
    @Value("${batch.thread.pool.max-size:20}")  private int    batchMaxSize;
    @Value("${batch.thread.pool.name-prefix:SubBatch-}") private String batchNamePrefix;

    @Primary
    @Bean(name = "subscriptionTaskExecutor")
    public Executor subscriptionTaskExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(corePoolSize);
        exec.setMaxPoolSize(maxPoolSize);
        exec.setQueueCapacity(queueCapacity);
        exec.setKeepAliveSeconds(keepAlive);
        exec.setThreadNamePrefix(namePrefix);
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setAwaitTerminationSeconds(30);
        exec.initialize();
        return exec;
    }


    @Bean(name = "batchTaskExecutor")
    public Executor batchTaskExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(batchCoreSize);
        exec.setMaxPoolSize(batchMaxSize);
        exec.setQueueCapacity(500);
        exec.setThreadNamePrefix(batchNamePrefix);
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setAwaitTerminationSeconds(60);
        exec.initialize();
        return exec;
    }


    @Bean(name = "scheduledExecutor")
    public ScheduledExecutorService scheduledExecutorService() {
        return Executors.newScheduledThreadPool(3, runnable -> {
            Thread t = new Thread(runnable);
            t.setName("SubScheduler-" + t.getId());
            t.setDaemon(false);
            return t;
        });
    }
}
