import program from 'commander';
import dotenv from 'dotenv';
import CreateTask from './CreateTask';
import path from 'path';
import inquirer from 'inquirer';

// 设置环境变量
/* 
  配置:
  1. gitlab服务器地址
  2. cmp server服务器地址
*/
dotenv.config({ 'path': path.join(__dirname, '..', '.env') });

program
  .command('create <componentName>') // 验证所有参数
  .action(async (componentName) => {
    await new CreateTask(componentName).run();
  });

program.parse(process.argv);
