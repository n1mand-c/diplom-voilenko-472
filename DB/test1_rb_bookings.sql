-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: test1
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `rb_bookings`
--

DROP TABLE IF EXISTS `rb_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rb_bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hotel_id` int NOT NULL,
  `room_type_id` int DEFAULT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `guests_count` int DEFAULT '1',
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'card',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `discount_applied` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `hotel_id` (`hotel_id`),
  CONSTRAINT `rb_bookings_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `rb_hotels` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rb_bookings`
--

LOCK TABLES `rb_bookings` WRITE;
/*!40000 ALTER TABLE `rb_bookings` DISABLE KEYS */;
INSERT INTO `rb_bookings` VALUES (1,4,'Анна Іванова','ivanova@gmail.com','+39 493 439 49 43',4,NULL,'2026-03-20','2026-03-21',2,7800.00,'card','confirmed','2026-03-19 11:28:18',0),(2,5,'Петро Петренко','petro@gmail.com','+380 63 484 848 81 81',1,NULL,'2026-03-23','2026-03-27',2,22800.00,'transfer','confirmed','2026-03-21 16:14:43',0),(3,5,'Андрій Петренко','petrenko@gmail.com','+380 32 433 123 33 22',2,NULL,'2026-04-01','2026-04-04',3,15000.00,'transfer','confirmed','2026-03-21 16:52:43',0),(4,5,'Андрій Петренко','petrenko@gmail.com','+380 32 433 123 33 22',3,NULL,'2026-03-27','2026-03-29',4,6200.00,'card','confirmed','2026-03-21 17:15:53',0),(5,5,'Андрій Петренко','petrenko@gmail.com','+380 32 433 123 33 22',3,NULL,'2026-03-20','2026-04-05',1,49600.00,'card','confirmed','2026-03-21 17:16:15',0),(6,5,'Андрій Петренко','petrenko@gmail.com','+380 32 433 123 33 22',2,NULL,'2026-04-02','2026-04-05',1,11400.00,'transfer','confirmed','2026-03-21 17:16:31',0),(7,2,'H. H.','oksanagulenko4@gmail.com','12312312312',3,NULL,'2026-06-01','2026-06-07',2,18600.00,'card','confirmed','2026-03-21 17:23:07',0),(8,2,'H. H.','oksanagulenko4@gmail.com','12312312312',4,NULL,'2026-03-23','2026-03-28',2,39000.00,'transfer','confirmed','2026-03-22 18:21:00',0),(9,2,'H. H.','oksanagulenko4@gmail.com','12312312312',3,NULL,'2026-03-05','2026-03-06',2,3100.00,'transfer','confirmed','2026-03-22 19:09:15',0),(10,2,'H. H.','oksanagulenko4@gmail.com','12312312312',7,11,'2026-03-31','2026-04-02',2,19000.00,'transfer','confirmed','2026-04-02 10:14:27',0),(11,8,'Андрій Іванов','andria@gmail.com','+38 064 943 43 324',7,10,'2026-04-05','2026-04-10',2,27500.00,'transfer','confirmed','2026-04-02 16:54:15',0),(12,2,'H. H.','oksanagulenko4@gmail.com','12312312312',7,10,'2026-03-31','2026-04-02',1,9900.00,'transfer','confirmed','2026-04-22 13:15:36',0),(13,2,'H. H.','oksanagulenko4@gmail.com','12312312312',7,10,'2026-03-31','2026-04-02',2,11000.00,'transfer','cancelled','2026-04-22 13:17:35',0),(14,9,'Антон Іванов','ivanov@gmail.com','+380 63 747 84 43',4,6,'2026-03-31','2026-04-02',1,5040.00,'transfer','confirmed','2026-04-22 13:36:00',1),(15,2,'H. H.','oksanagulenko4@gmail.com','12312312312',7,10,'2026-03-31','2026-04-02',1,11000.00,'transfer','pending','2026-04-23 12:37:25',0),(16,2,'H. H.','oksanagulenko4@gmail.com','12312312312',7,10,'2026-03-31','2026-04-02',2,11000.00,'transfer','pending','2026-04-26 22:17:10',0),(17,4,'Анна Іванова','ivanova@gmail.com','+39 493 439 49 43',7,10,'2026-03-31','2026-04-02',2,11000.00,'transfer','pending','2026-04-26 22:28:30',0),(18,4,'Анна Іванова','ivanova@gmail.com','+39 493 439 49 43',7,10,'2026-03-31','2026-04-02',2,11000.00,'transfer','pending','2026-04-26 22:28:41',0),(19,4,'Анна Іванова','ivanova@gmail.com','+39 493 439 49 43',7,10,'2026-03-31','2026-04-02',2,11000.00,'transfer','pending','2026-04-26 22:28:52',0),(20,4,'Анна Іванова','ivanova@gmail.com','+39 493 439 49 43',7,10,'2026-03-31','2026-04-02',2,11000.00,'transfer','confirmed','2026-04-26 22:29:06',0),(21,4,'Анна Іванова','ivanova@gmail.com','+39 493 439 49 43',7,10,'2026-03-31','2026-04-02',2,11000.00,'transfer','confirmed','2026-04-26 22:30:50',0),(22,9,'Антон Іванов','ivanov@gmail.com','+380 63 747 84 43',4,6,'2026-04-07','2026-04-08',2,2800.00,'transfer','confirmed','2026-04-30 12:23:49',0),(23,4,'Анна Іванова','ivanova@gmail.com','+39 493 439 49 43',5,8,'2026-04-07','2026-04-08',2,3700.00,'transfer','confirmed','2026-04-30 12:35:19',0),(24,4,'Анна Іванова','ivanova@gmail.com','+39 493 439 49 43',3,9,'2026-03-29','2026-03-30',4,5800.00,'transfer','confirmed','2026-04-30 12:45:19',0),(25,9,'Антон Іванов','ivanov@gmail.com','+380 63 747 84 43',4,6,'2026-05-12','2026-05-14',2,5600.00,'transfer','cancelled','2026-05-01 16:36:31',0),(26,9,'Антон Іванов','ivanov@gmail.com','+380 63 747 84 43',5,8,'2026-05-06','2026-05-09',2,9990.00,'transfer','confirmed','2026-05-04 19:44:19',1),(27,9,'Антон Іванов','ivanov@gmail.com','+380 63 747 84 43',3,5,'2026-05-06','2026-05-09',2,9300.00,'transfer','pending','2026-05-04 19:44:55',0),(28,2,'H. H.','oksanagulenko4@gmail.com','12312312312',7,10,'2026-05-13','2026-05-22',1,49500.00,'transfer','confirmed','2026-05-04 20:41:56',0),(29,2,'H. H.','oksanagulenko4@gmail.com','12312312312',6,13,'2026-05-20','2026-05-23',1,12000.00,'card','confirmed','2026-05-05 01:31:20',0),(30,10,'gfg gfgfgf','fggf@gfgfgg.com','4384930940',1,1,'2026-05-06','2026-05-08',2,7560.00,'transfer','confirmed','2026-05-05 17:29:12',1),(31,9,'Антон Іванов','ivanov@gmail.com','+380 63 747 84 43',5,8,'2026-05-18','2026-05-20',1,7400.00,'transfer','cancelled','2026-05-07 22:56:32',0),(32,11,'Георгій Іванов','gorg@gmail.com','38 050 050 50 50',5,8,'2026-05-18','2026-05-20',1,7400.00,'transfer','pending','2026-05-07 23:17:42',0),(33,13,'Fred Schmidt','fred@gmail.com','+49176051743',7,12,'2026-05-18','2026-05-20',2,26000.00,'transfer','confirmed','2026-05-18 15:46:03',0),(34,14,'Єгор Войленко','egorr@gmail.com','+380635870574',7,11,'2026-05-18','2026-05-20',3,19000.00,'transfer','confirmed','2026-05-18 15:52:29',0),(35,2,'H. H.','oksanagulenko4@gmail.com','12312312312',7,10,'2026-06-01','2026-06-03',1,9900.00,'transfer','cancelled','2026-05-18 15:57:30',1);
/*!40000 ALTER TABLE `rb_bookings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 18:17:32
