var config = {
    // 接口
    interface: {
        login: "/user/login",
        getUser: "/user/getUser",
        getOriginByUrl: "/admin/grab/getOriginByUrl",
        saveData: "/admin/grab/saveData"
    },
    // 本地
    local: {
        baseUrl: "http://localhost",
    },
    // 线上
    online: {
        baseUrl: "http://www.hotcn.top"
    }
};

module.exports = config;