const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');

const app = express();

// express 초기셋팅
app.disable('x-powered-by');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true,
}));
// app.use(timeout(process.env.TIMEOUT));
app.use(cors());
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.xssFilter({ setOnOldIE: true }));
app.use(express.static(`./${fs.existsSync('dist') ? 'dist' : 'src'}/public`)); // ui setting

// // for io logging
// app.use((req, res, next) => {
//    const st = new Date();
//    res.on('finish', () => {
//       console.log('%s - %s %s %s %s ms', req.ip, req.method, req.originalUrl, res.statusCode, (new Date() - st));
//    });

//    next();
// });


const port = 48080;

const options = {
   key: fs.readFileSync('./cert/server.key'),
   cert: fs.readFileSync('./cert/server.crt'),
};

app.use((req,res) => {
    let url = req.url || null;
    let fileName = '';

    const basePath = '/home/soe/soe/simul/aceSample';
    const baseUrl = '/cot/serviceEndpoint/api/ncs'
    const header = req.get('LoginUserID');

    let _error = {
        msg : '요청 값을 확인해주세요',
        api_url : url,
        LoginUserID : header || 'undefined',
        error : req.body,
    };

    console.log(`[url]:${url}`)
    console.log(`[header]:${header}`)

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');

    try{
        if(url){
            if(url === `${baseUrl}/cs/hc/voicebot/retrieveUnpaidContract`){   // 미납보험조회
                fileName = `${basePath}/NPRO_KORAH_GET_CONT_UNPAID_INS.res`;
            }else if(url === `${baseUrl}/cs/ss/sms/retrieveVoice_sendSmsAppProc`){ // 메시지 전송
                fileName = `${basePath}/NPRO_KORAH_REQ_SEND_MSG.res`;
            }else if(url === `${baseUrl}/cs/hc/voicebot/retrievePsellCmptYn`){ // 완판 완료여부 및 스크립트 결과 전송
                fileName = `${basePath}/NPRO_KORAH_GET_SUCC_SAILS_RESULT.res`;
            }else if(url === `${baseUrl}/cs/hc/voicebot/retrieveGetResendCertificate`){ // 청약서류 발송 이력 조회
                fileName = `${basePath}/NPRO_KORAH_GET_SUBS_DOC_HIST.res`; 
            }else if(url === `${baseUrl}/cs/hc/voicebot/retrieveResendCertificate`){ // 청약서류 재발송
                fileName = `${basePath}/NPRO_KORAH_REQ_SUBS_DOC.res`;
            }else if(url === `${baseUrl}/cs/hc/voicebot/reSendElectPsell`){ // 전자완판 재발송
                fileName = `${basePath}/NPRO_KORAH_REQ_ELEC_SUCC_SAILS.res`;
            }else if(url === `${baseUrl}/cs/hc/voicebot/requestConnect`){ // 모집인 연결요청
                fileName = `${basePath}/NPRO_KORAH_REQ_CONN_AGENT.res`;
            }else if(url === `${baseUrl}/cs/cs/voicebot/retrievePolicyDropTarget`){ // 청약철회 숙려대상 조회
                fileName = `${basePath}/NPRO_KORAH_GET_SUBS_WITHDRAW.res`;
            }else if(url === `${baseUrl}/cs/cs/voicebot/insertPolicyDropTarget`){ // 청약철회 숙려대상 접수
                fileName = `${basePath}/NPRO_KORAH_REQ_SUBS_WITHDRAW.res`;
            }else if(url === `${baseUrl}/cs/hc/happyCall/insertCallResult`){ // 통화결과 수신
                fileName = `${basePath}/NPRO_KORAH_REQ_CONSULTING_HIST.res`;
            }else if(url === '/cot/serviceEndpoint/json'){
                const svcNm = req.body.svcNm;
                if(svcNm === 'CCD105SVC'){ // 콜백접수
                    fileName = `${basePath}/NPRO_REQ_CALLBACK.res`
                }else{ // 예약콜 접수
                    fileName = `${basePath}/NPRO_REQ_RESERVATION_CALL.res`
                }
            }
            let data = fs.readFileSync(fileName);
            return res.status(200).json(JSON.parse(data));
        }else{
            return res.status(404).json(_error);
        }
    }catch(error){
        _error.error = error;
        return res.status(500).json(_error);
    }

});

http.createServer(options, app)
    .listen(port, () => {
        console.log(`Https server listening on port ${port}`);
    });