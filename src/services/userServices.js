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

    patchUserMe: async (okx_api_key, okx_api_secret, okx_api_passphrase) => {
        const token = UserServices.getUserToken();

        const response = await axios.patch(
            `${config.API_BASE_URL}/api/user/me`,
            {
              okx_api_key: okx_api_key,
              okx_api_secret: okx_api_secret,
              okx_api_passphrase: okx_api_passphrase
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
            userInfo = {
                id: userData.id, // ID 필드 추가
                email: userData.email,
                name: userData.name,
                role: "broker",
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
    }
}


export default UserServices;