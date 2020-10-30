/*
 Navicat Premium Data Transfer

 Source Server         : 蘑菇钉
 Source Server Type    : MySQL
 Source Server Version : 50562
 Source Host           : 47.106.135.2:3306
 Source Schema         : moguding

 Target Server Type    : MySQL
 Target Server Version : 50562
 File Encoding         : 65001

 Date: 29/10/2020 19:22:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `userId` int(11) NOT NULL COMMENT '用户id',
  `username` varchar(255) DEFAULT NULL COMMENT '用户名称',
  `phone` varchar(255) DEFAULT NULL COMMENT '用户手机号',
  `gender` varchar(255) DEFAULT NULL COMMENT '用户性别',
  `token` text NOT NULL COMMENT 'token重要',
  `schoolName` varchar(255) DEFAULT NULL COMMENT '学校名称',
  `depName` varchar(255) DEFAULT NULL COMMENT '院',
  `majorName` varchar(255) DEFAULT NULL COMMENT '系',
  `className` varchar(255) DEFAULT NULL COMMENT '班',
  `studentNumber` int(11) DEFAULT NULL COMMENT '学号',
  `grade` varchar(255) DEFAULT NULL COMMENT '入学时间',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  `planId` varchar(255) DEFAULT NULL COMMENT '打卡必备',
  PRIMARY KEY (`userId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
