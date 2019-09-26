import { log, warn, fatal, success } from '../helpers/logger';
import service from './service';
import inquirer from 'inquirer';
import execa from 'execa';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
const tildify = require('tildify');
const chalk = require('chalk');
const download = require('download-git-repo');


export default class CreateTask {
  constructor(name) {
    this.meta = {};
    this.setMetaCompName(name);
  }
  setMetaCompName = (name) => {
    this.meta.name = name;
  }
  setMetaGitInfo = ({ project, username, repository}) => {
    this.meta.git = {
      project,
      username,
      repository,
    }
  }
  getRepositoryName =  () => {
    const { name } = this.meta;
    return `ux-smartcomp-${name}`;
  }
  checkComponentRepositoryIsExit = async () => {
    log('检查组件项目是否存在.');
    try {
      const { repositoryUrl = '' } = await service.checkComponentRepositoryIsExit(this.meta.name);
      if (!repositoryUrl) { // 项目不存在
        return;
      }
      // 项目已经存在
      warn(`${this.getRepositoryName()}项目已经存在：${repositoryUrl}`);
      // 需要重新命名
      const name = await inquirer.prompt({ message: '重新输入组件名称 > ', type: 'input', name: 'compName'});
      this.checkComponentRepositoryIsExit();
    } catch (e) {
      fatal('检查项目', e);
    }
  }
  createRemoteRepository = async () => {
    // 获取 git username
    log('创建组件远程仓库');
    const { stdout } = execa.sync('git', ['config', 'user.name'])
    const username = `${stdout}`.replace(/^\s+|\s+$/, '')
    if (!username) {
      log(`未通过 'git config user.name' 获取到用户名，无法在Gitlab项目中添加开发者权限`)
      log(`解决方案：`)
      log(` 1. 通过 'git config user.name' 命令设置与Gitlab相同的用户名`)
      log(` 2. 使用 '--username' 参数，例如：'bscpm create --username guojia6'`)
      return fatal();
    }
    // 生成 项目名称
    const project = this.getRepositoryName();
    // 发送 创建仓库 
    const { isSucceed, msg, repositoryUrl: repository } = await service.createRemoteRepository({ username, project });
    if (!isSucceed) {
      return fatal('创建远程仓库失败:', new Error(msg));
    }
    success('组件远程创建：成功！');
    log(`远程仓库地址：${repository}`);
    this.setMetaGitInfo({ username, project, repository});
  }
  downTemplate = async () => {
    const { git = { } } = this.meta;
    const { project } = git;
    const { TEMPLATE: template } = process.env;
    log(`开始创建项目 ${chalk.yellow(tildify(project))}`);
    const spinner = ora("下载项目模板");
    const inPlace = !project || project === ".";
    const to = path.resolve(project || ".");
    spinner.start();
    try {
      await new Promise((resolve, rejected) => {
        download(template, to, function (err) {
          spinner.stop();
          if (err) {
            return rejected(err);
          }
          resolve();
        })
      });
    } catch(e) {
      fatal(`下载失败${template}`, e);
    }
    spinner.stop();
    log(`创建项目 ${chalk.yellow('success')}`);
  }
  run = async () => {
    // 检查项目是否存在
    await this.checkComponentRepositoryIsExit();
    // 创建git仓库
    await this.createRemoteRepository();
    // 创建本地文件
    await this.downTemplate();
  }
}
