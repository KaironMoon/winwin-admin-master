import axios from 'axios';
import config from '../config';

const UserServices = {
    getUserToken: () => {
        const tokenInfoStr = localStorage.getItem("tokenData");
        let token = null;
        try{
            if (tokenInfoStr) {
                token = JSON.parse(tokenInfoStr).token;
            }
        } catch (error) {
            console.error("Error parsing tokenInfo", error);
        }
        return token;
    },

    patchUserMe: async (okx_api_key, okx_api_secret, okx_demo_api_key, okx_demo_api_secret, okx_api_passphrase, name, email, password, currentPassword) => {
        const token = UserServices.getUserToken();

        let requestData = {
        }

        if (name) {
            requestData.name = name;
        }
        if (email) {
            requestData.email = email;
        }
        if (password) {
            requestData.password = password;
            // 비밀번호를 변경하려면 현재 비밀번호도 필요
            if (currentPassword) {
                requestData.current_password = currentPassword;
            }
        }
        if (okx_api_key) {
            requestData.okx_api_key = okx_api_key;
        }
        if (okx_api_secret) {
            requestData.okx_api_secret = okx_api_secret;
        }
        if (okx_api_passphrase) {
            requestData.okx_api_passphrase = okx_api_passphrase;
        }
        if (okx_demo_api_key) {
            requestData.okx_demo_api_key = okx_demo_api_key;
        }
        if (okx_demo_api_secret) {
            requestData.okx_demo_api_secret = okx_demo_api_secret;
        }

        const response = await axios.patch(
            `${config.API_BASE_URL}/api/user/me`,
            {
              ...requestData
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
        );
    
        return response;
    },

    getUserMe: async (isDemo) => {
        const token = UserServices.getUserToken();
        console.log("token", token);

        const response = await fetch(`${config.API_BASE_URL}/api/user/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
        });

        let userInfo = null;

        if (response.ok) {
            const userData = await response.json();

            if (userData.level !== 'admin') {
                throw new Error('UNAUTHORIZED_ACCESS');
            }

            userInfo = {
                id: userData.id, // ID 필드 추가
                email: userData.email,
                name: userData.name,
                role: userData.level, // level 값을 role에 저장
                okx_api_key: userData.okx_api_key,
                okx_api_secret: userData.okx_api_secret,
                okx_api_passphrase: userData.okx_api_passphrase
            }

            if (isDemo) {
                userInfo.okx_api_key = userData.okx_demo_api_key;
                userInfo.okx_api_secret = userData.okx_demo_api_secret;
                userInfo.okx_api_passphrase = userData.okx_api_passphrase;
            }

            // localStorage에 userInfo 저장
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }

        return userInfo;
    },
    getListByPage: async (searchText, page, pageSize, isDemoFilter = false) => {
        const token = UserServices.getUserToken();
        const params = new URLSearchParams();
        if (searchText) {
            params.append('search_factor', searchText);
        }
        if (page !== undefined) {
            params.append('page', page);
        }
        if (pageSize) {
            params.append('pageSize', pageSize);
        }
        params.append('with_statistics', 'true');
        params.append('is_demo', isDemoFilter);
        const queryString = params.toString();
        const url = `${config.API_BASE_URL}/api/user${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response;
    },
    getUserById: async (userId) => {
        const token = UserServices.getUserToken();
        const response = await fetch(`${config.API_BASE_URL}/api/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response;
    }, 
    putUser: async (userId, userInfo) => {
        const token = UserServices.getUserToken();
        const response = await fetch(`${config.API_BASE_URL}/api/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        });
        return response;
    },
    deleteUser: async (userId) => {
        const token = UserServices.getUserToken();
        const response = await fetch(`${config.API_BASE_URL}/api/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response;
    },

    /**
     * 관리자 메모 업데이트
     * @param {number} userId - 사용자 ID
     * @param {string} adminMemo - 관리자 메모 내용
     * @returns {Promise} - 업데이트된 사용자 정보
     */
    updateAdminMemo: async (userId, adminMemo) => {
        const token = UserServices.getUserToken();
        const response = await axios.patch(
            `${config.API_BASE_URL}/api/user/${userId}/admin-memo`,
            { admin_memo: adminMemo },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }
}


export default UserServices;