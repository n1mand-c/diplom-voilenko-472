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
-- Table structure for table `rb_support_messages`
--

DROP TABLE IF EXISTS `rb_support_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rb_support_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `sender_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `rb_support_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `rb_support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rb_support_messages`
--

LOCK TABLES `rb_support_messages` WRITE;
/*!40000 ALTER TABLE `rb_support_messages` DISABLE KEYS */;
INSERT INTO `rb_support_messages` VALUES (1,1,'USER','фівфі','2026-05-01 17:04:21'),(2,1,'ADMIN','Добрий день яке в вас запитання?','2026-05-01 17:04:50'),(3,1,'USER','одне як справи?','2026-05-01 17:05:15'),(4,2,'USER','fdfd','2026-05-01 17:07:01'),(5,2,'ADMIN','fdfd','2026-05-01 17:07:33'),(6,3,'USER','fdfdfdf','2026-05-01 22:47:07'),(7,3,'ADMIN','gklhkhg','2026-05-01 22:47:22'),(8,6,'ROLE_USER','ggg','2026-05-05 00:50:09'),(9,6,'ROLE_USER','gg','2026-05-05 00:50:18'),(10,6,'ROLE_ADMIN','yfyfy','2026-05-05 00:50:44'),(11,6,'ROLE_ADMIN','gg','2026-05-05 00:50:46'),(12,4,'ROLE_ADMIN','213123 ','2026-05-05 00:57:54'),(13,2,'ROLE_MANAGER','авава','2026-05-05 01:03:17'),(14,7,'ROLE_USER','sdsdsdsd','2026-05-05 17:33:29'),(15,7,'ROLE_USER','fdfdfdfd','2026-05-05 17:33:34'),(16,7,'ROLE_MANAGER','fdfdfdfdf','2026-05-05 17:34:15'),(17,7,'ROLE_MANAGER','fdfdfdfd','2026-05-05 17:34:17'),(18,8,'ROLE_USER','123','2026-05-18 15:46:27'),(19,8,'ROLE_USER','123123','2026-05-18 15:46:30'),(20,9,'ROLE_USER','123123','2026-05-18 15:54:34'),(21,9,'ROLE_USER','123123','2026-05-18 15:54:39'),(22,9,'ROLE_MANAGER','123123','2026-05-18 15:54:55'),(23,9,'ROLE_MANAGER','123','2026-05-18 15:54:56'),(24,9,'ROLE_MANAGER','123','2026-05-18 15:54:56'),(25,9,'ROLE_MANAGER','123','2026-05-18 15:54:57'),(26,10,'ROLE_USER','jkobhjnjhjm','2026-05-22 20:38:03'),(27,10,'ROLE_ADMIN','redrtedt\\','2026-05-22 20:38:17'),(28,10,'ROLE_ADMIN','gfytffuyf','2026-05-22 20:38:19');
/*!40000 ALTER TABLE `rb_support_messages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 18:17:33
