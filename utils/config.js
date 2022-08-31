//上线前修改成release  每一个版本会对应不同的接口地址和常量
//develop:开发测试版 trial:演示版   release:正式版
export const ProgramEnvVersion = 'trial'

/**
 * 获取常量
 * 会根据小程序的版本来适配
 */
export function getConstantData() {

    var obj = {
        // RheumatologyID: '1030810', //风湿科代码
        RheumatologyID: '2350010', //风湿科代码 营养门诊
        RheumatologyQuestionnaire: '', //风湿科问卷
        JingshenQuestionnaire: '', //精神科问卷问卷 目前写死
        //http://192.168.1.122/s/70ff576008984e119f817890b3317f33
        envVersion: 'trial', //跳转互联网医院小程序的版本 trial：体验版  develop：开发板
    }
    if (ProgramEnvVersion === 'develop') { //开发版 测试版
        // obj.RheumatologyQuestionnaire = '/s/17f6a6dbe2834aaf860efd81d176ca2a'//122
        obj.RheumatologyQuestionnaire = '/s/6ba044a29cd3403f86e2f489405046aa'//重构地址
        obj.JingshenQuestionnaire = '/s/668eb8e4ca8f468cbab066e963919dc5'
        obj.envVersion = 'trial'
    } else if (ProgramEnvVersion === 'trial') { //演示版
        obj.RheumatologyQuestionnaire = '/s/17f6a6dbe2834aaf860efd81d176ca2a'
        obj.JingshenQuestionnaire = '/s/668eb8e4ca8f468cbab066e963919dc5'
        obj.envVersion = 'trial'
    } else if (ProgramEnvVersion === 'release') { //正式版
        obj.RheumatologyQuestionnaire = '/s/5d548de41cde45518c6b41288584ac5f'
        obj.JingshenQuestionnaire = '/s/668eb8e4ca8f468cbab066e963919dc5'
        obj.envVersion = 'release'
    }
    return obj
}