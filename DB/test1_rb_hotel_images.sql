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
-- Table structure for table `rb_hotel_images`
--

DROP TABLE IF EXISTS `rb_hotel_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rb_hotel_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hotel_id` (`hotel_id`),
  CONSTRAINT `rb_hotel_images_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `rb_hotels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rb_hotel_images`
--

LOCK TABLES `rb_hotel_images` WRITE;
/*!40000 ALTER TABLE `rb_hotel_images` DISABLE KEYS */;
INSERT INTO `rb_hotel_images` VALUES (21,7,'https://maldivy.ru/upload/resize_cache/iblock/88d/ju633helsdu8kgw43lcbw2bpkyv432ty.webp'),(22,7,'https://maldivy.ru/upload/resize_cache/iblock/dec/0w0lwk1ixkh519shtvgg3m92c03v1r3i.webp'),(23,7,'https://maldivy.ru/upload/resize_cache/iblock/f7f/7vfsfliuqdf8xjrrig3bbkrvwcikvooa.webp'),(24,7,'https://maldivy.ru/upload/resize_cache/iblock/0ed/29pm9ad5t8kra4j39f34uhgrvedoeg1b.webp'),(26,2,'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop'),(27,1,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop'),(28,3,'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&auto=format&fit=crop'),(29,4,'https://cf.bstatic.com/xdata/images/hotel/max1024x768/585976092.jpg?k=c94847ea9a65ea0a68c963478b1f704c7e7dc2faa0f9b525dd7e84c98d8d6d2f&o='),(30,5,'https://cf.bstatic.com/xdata/images/hotel/max1024x768/410406102.jpg?k=d1efbb67613b2636511e33c84870131fb90a36ae49438aaca6697ba14c8846cb&o='),(31,5,'https://cf.bstatic.com/xdata/images/hotel/max500/130050803.jpg?k=fa26eff9e11b809d51139271ccb9efe3d28650787a624b3f99c448c88eab89a7&o='),(32,5,'https://cf.bstatic.com/xdata/images/hotel/max500/130050880.jpg?k=a6d34c19f74a0ba8a2d9ca8367d59d554bcbb3979cf34fadf83a9c55d30d83b1&o='),(33,5,'https://cf.bstatic.com/xdata/images/hotel/max300/130050683.jpg?k=adc5290ed61aba0f34c334cfa8a6057178c64715e8a56d84cc432c2949498e2f&o='),(35,6,'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/8e/5e/45/boka-hotel-and-waterfall.jpg?w=900&h=500&s=1');
/*!40000 ALTER TABLE `rb_hotel_images` ENABLE KEYS */;
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
