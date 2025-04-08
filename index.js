import chalk from "chalk";
import fs from "fs";

const delayRefresh = 28800 // seconds

const current = async (address) => {
    const url = `https://api.tea-fi.com/wallet/check-in/current?address=${address}`

    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en,en-US;q=0.9,id;q=0.8',
        'dnt': '1',
        'origin': 'https://app.tea-fi.com',
        'priority': 'u=1, i',
        'referer': 'https://app.tea-fi.com/',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    }

    while(true) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            })

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`)
            }

            return await response.json()
        } catch (err) {
            console.log(chalk.red(`❌ Error to get current data: ${err.message}`))
        }
    }
}

const checkin = async (address) => {
    const url = `https://api.tea-fi.com/wallet/check-in?address=${address}`

    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en,en-US;q=0.9,id;q=0.8',
        'content-length': '0',
        'dnt': '1',
        'origin': 'https://app.tea-fi.com',
        'priority': 'u=1, i',
        'referer': 'https://app.tea-fi.com/',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    }

    while(true) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
            })

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`)
            }

            return await response.json()
        } catch (err) {
            console.log(chalk.red(`❌ Error to get check-in: ${err.message}`))
        }
    }
}

const timeCount = async (waktu) => {
    for (let i = waktu; i >= 0; i--) {
        // inisiasi menit dan second
        let minutes = Math.floor(waktu/60)
        let seconds = waktu % 60;

        // jika menit dan second < 2 digit
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        // BOOMM tampilkan ******
        process.stdout.write(`⏳ Delay ${chalk.yellow(`${minutes}:${seconds} menit`)} `);
        
        // increament - 1
        waktu = waktu-1;

        // blocking delay untuk satu detik
        await new Promise(resolve => setTimeout(resolve, 1000))

        // clear last console log
        if (waktu >= 0) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0); 
        }
    }
}

(async () => {
    console.log("🍵 Tea-Fi Swap Daily Check-in")

    try {
        // read evmaddress.txt
        const data = fs.readFileSync('evmaddress.txt', 'utf-8');
        const evmaddresses = data.split('\n')
        // console.log(evmaddresses)

        while(true) {
            for(const address of evmaddresses) {
                if(address!="") {
                    const current_data = await current(address.trim())
                    const streak = current_data.streak
                    const activity_lvl = current_data.activityLevel
                    const start_day = new Date(current_data.currentDay.start)
                    const end_day = new Date(current_data.currentDay.end)
                    const last_check = new Date(current_data.lastCheckIn)
                    
                    // print evm, streak, last check
                    console.log(`\n🔑 EVM address: ${chalk.green(address)}\n🔥 Streak: ${chalk.yellow(`${streak} hari`)}\n📋 Activity level: ${chalk.yellow(`${Number(activity_lvl*100)}%`)}\n🕒 Last check-in: ${chalk.green(last_check.toDateString(), last_check.toTimeString())}`)
    
                    // console.log(start_day.getUTCDate(), end_day.getUTCDate(), last_check.getUTCDate())
    
                    if (end_day.getUTCDate()!=last_check.getUTCDate()) {
                        await checkin(address.trim())
                        console.log(chalk.green("🟢 Check-in available!"))
                    } else {
                        console.log(chalk.red("🔴 Already check-in"))
                    }
                }
            }
            // delay
            console.log()
            await timeCount(Number(delayRefresh))
        }
    } catch (e) {
        // jika evmaddress.txt not exist
        if (e.code == 'ENOENT') {
            console.log('📝 Fill the evmaddress.txt first!');
            fs.writeFileSync('evmaddress.txt', "0x12345671\n0x9876543\netc...")
            process.exit()
        } else {
            throw e
        }
    }

    
})()