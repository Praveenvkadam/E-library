package com.subscriptionpayment.subscriptionpayment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableDiscoveryClient
public class SubscriptionpaymentApplication {

	public static void main(String[] args) {
		SpringApplication.run(SubscriptionpaymentApplication.class, args);
	}

}
