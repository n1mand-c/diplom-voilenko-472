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
-- Table structure for table `rb_support_tickets`
--

DROP TABLE IF EXISTS `rb_support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rb_support_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hotel_id` int DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hotel_id` (`hotel_id`),
  CONSTRAINT `rb_support_tickets_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `rb_hotels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rb_support_tickets`
--

LOCK TABLES `rb_support_tickets` WRITE;
/*!40000 ALTER TABLE `rb_support_tickets` DISABLE KEYS */;
INSERT INTO `rb_support_tickets` VALUES (1,9,'asdf','gogo@altiora.com',NULL,'фівфі','closed','2026-05-01 17:04:21','2026-05-01 17:05:40'),(2,9,'asdf','gogo@altiora.com',7,'fdfd','closed','2026-05-01 17:07:01','2026-05-01 17:07:35'),(3,9,'asdf','fd@gfgf.com',2,'fdfdfdf','closed','2026-05-01 22:47:07','2026-05-01 22:47:28'),(4,1,'test','test@test.com',NULL,'Звернення від test (test@test.com)','closed','2026-05-05 00:40:24','2026-05-05 00:58:04'),(5,1,'test','test@test.com',NULL,'Звернення від test (test@test.com)','closed','2026-05-05 00:42:25','2026-05-05 00:58:07'),(6,9,'ffgggf','fffg@gmail.com',NULL,'yty','closed','2026-05-05 00:50:09','2026-05-05 00:50:49'),(7,10,'fdfdf','fdfff@gmail.cim',7,'sdsdsds','closed','2026-05-05 17:33:29','2026-05-05 17:34:20'),(8,13,'123','123@gmail.com',NULL,'123','closed','2026-05-18 15:46:27','2026-06-06 13:59:00'),(9,14,'123','123@gmail.com',7,'123','closed','2026-05-18 15:54:34','2026-05-18 15:54:59'),(10,14,'fggyhhhj','bvhghh@gjjv.com',NULL,'hnjjjbnn','closed','2026-05-22 20:38:03','2026-05-22 20:38:21');
/*!40000 ALTER TABLE `rb_support_tickets` ENABLE KEYS */;
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
