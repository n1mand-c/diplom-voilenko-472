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
-- Table structure for table `rb_booking_splits`
--

DROP TABLE IF EXISTS `rb_booking_splits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rb_booking_splits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `user_id` int NOT NULL,
  `invited_by` int NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','declined') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `rb_booking_splits_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `rb_bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rb_booking_splits`
--

LOCK TABLES `rb_booking_splits` WRITE;
/*!40000 ALTER TABLE `rb_booking_splits` DISABLE KEYS */;
INSERT INTO `rb_booking_splits` VALUES (1,21,4,4,50.00,5500.00,'paid','transfer','2026-04-27 00:30:51','2026-04-27 00:30:50'),(2,21,9,4,50.00,5500.00,'paid','transfer','2026-04-27 00:31:22','2026-04-27 00:30:50'),(3,22,9,9,60.00,1680.00,'paid','transfer','2026-04-30 14:23:50','2026-04-30 14:23:50'),(4,22,4,9,40.00,1120.00,'pending',NULL,NULL,'2026-04-30 14:23:50'),(5,23,4,4,50.00,1850.00,'paid','transfer','2026-04-30 14:43:40','2026-04-30 14:35:19'),(6,23,9,4,50.00,1850.00,'paid','card','2026-04-30 14:35:58','2026-04-30 14:35:19'),(7,24,4,4,50.00,2900.00,'paid','transfer','2026-04-30 14:46:21','2026-04-30 14:45:19'),(8,24,9,4,50.00,2900.00,'paid','card','2026-04-30 14:46:07','2026-04-30 14:45:19'),(9,27,9,9,50.00,4650.00,'pending','transfer',NULL,'2026-05-04 21:44:56'),(10,27,8,9,50.00,4650.00,'paid','transfer','2026-05-04 21:45:18','2026-05-04 21:44:56'),(11,28,2,2,50.00,24750.00,'paid','transfer','2026-05-04 22:59:31','2026-05-04 22:41:57'),(12,28,9,2,50.00,24750.00,'paid','transfer','2026-05-04 22:59:31','2026-05-04 22:41:57'),(13,30,10,10,50.00,3780.00,'paid','transfer','2026-05-05 19:30:38','2026-05-05 19:29:13'),(14,30,9,10,50.00,3780.00,'paid','transfer','2026-05-05 19:30:38','2026-05-05 19:29:13'),(15,33,13,13,40.00,10400.00,'paid','transfer','2026-05-18 17:47:06','2026-05-18 17:46:03'),(16,33,4,13,60.00,15600.00,'paid','transfer','2026-05-18 17:47:06','2026-05-18 17:46:03'),(17,34,14,14,40.00,7600.00,'paid','transfer','2026-05-18 17:53:14','2026-05-18 17:52:29'),(18,34,4,14,60.00,11400.00,'paid','transfer','2026-05-18 17:53:14','2026-05-18 17:52:29');
/*!40000 ALTER TABLE `rb_booking_splits` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 18:17:34
