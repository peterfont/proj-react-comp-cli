
import axios from 'axios';
import ora from 'ora';
import { log, warn, fatal } from '../helpers/logger';

const getData = async (mock, tip) => {
  const spinner = ora(tip);
  spinner.start();
  let ret = {};
  try {
    const { CMP_SERVER_HOST, GITLAB_HOST } = process.env;
    // ret =  await axios.get(`${CMP_SERVER_HOST}/api/v2/groups`);
    ret = await new Promise((resolve, rejected) => {
      setTimeout(() => {
        resolve({ data: mock });
      }, 2000);
    });
  } catch (e){
    fatal('获取数据出错', e);
  }
  spinner.stop();
  return ret;
}
// TODO: 提供检查组件是否已经被创建仓库的问题
// TODO: 提供创建githooks的接口
// TODO: 提供创建gitlab项目的工具
// TODO: 提供自动创建jekins job的工具
// TODO: 创建jekins job
// TODO: 提供更新组件仓库地址和资源地址的接口
const git_url = 'git@github.com:peterfont/webpack-project-template.git';
export default {
  // 检查组件是否已经被创建
  checkComponentRepositoryIsExit : async () => {
    const { data } = await getData({ repositoryUrl: '' }, '检查组件项目是否存在...');
    return data;
  },
  // 创建remote Repository
  createRemoteRepository: async ({ project, username }) => {
    const { CMP_SERVER_HOST } = process.env;
    const detaultData = {
      project,
      username,
      group: 'Assess',
      hook: `${CMP_SERVER_HOST}/webhooks/push`
    };
    // 创建git lab仓库
    const { data } = await getData({
      isSucceed: 1,
      repositoryUrl: git_url,
      msg: '权限不足'
    },
    '创建git项目');
    return data;
  }
}