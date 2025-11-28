# 苏格兰高地运动会管理系统

Highland Nexus - 一个完整的高地运动会管理系统

## 功能特性

- 用户登录注册
- 首页项目介绍
- 比赛列表和详情展示
- 在线报名系统
- 个人中心（查看申请记录）
- 地图展示比赛地点
- 获奖名单展示
- 管理员后台（CRUD 操作）
- 中英文双语切换

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Pinia
- Element Plus
- Vue-i18n
- Vite

## 安装运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

查看后端对应启动的端口到：highland-nexus-ui\src\api\config.js中进行修改
```

## 默认账号

- 普通用户: user@example.com / password123
- 管理员: admin@example.com / admin123

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件
├── views/          # 页面组件
├── router/         # 路由配置
├── stores/         # Pinia状态管理
├── locales/        # 国际化语言文件
├── api/            # API接口
├── mock/           # 模拟数据
└── utils/          # 工具函数
```
