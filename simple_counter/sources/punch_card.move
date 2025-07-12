module simple_counter::punch_card {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::vec_set::{Self, VecSet};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};

    /// 铜牌NFT结构体
    public struct CopperNFT has key, store {
        id: UID,
        owner: address,
        name: String,
        description: String,
        image_url: String,         // SVG图片的data url
        background_color: String,  // 随机生成的rgb字符串
        punch_time: u64,           // 打卡时间戳
    }

    /// 银牌NFT结构体
    public struct SilverNFT has key, store {
        id: UID,
        owner: address,
        name: String,
        description: String,
        image_url: String,
        background_color: String,
        punch_time: u64,
    }

    /// 金牌NFT结构体
    public struct GoldNFT has key, store {
        id: UID,
        owner: address,
        name: String,
        description: String,
        image_url: String,
        background_color: String,
        punch_time: u64,
    }

    /// 全局配置对象
    public struct PunchCardConfig has key {
        id: UID,
        copper_requirement: u64,
        silver_requirement: u64,
        gold_requirement: u64,
        time_interval: u64,
    }

    /// 用户打卡信息
    public struct UserPunchInfo has key, store {
        id: UID,
        owner: address,
        count: u64,
        last_punch_time: u64,
        rewards_claimed: u8,
    }

    /// 全局表
    public struct PunchCardTable has key {
        id: UID,
        table: Table<address, UserPunchInfo>,
        rankings: VecSet<address>,
        total_users: u64,
    }

    const COPPER_REWARD: u8 = 1;
    const SILVER_REWARD: u8 = 2;
    const GOLD_REWARD: u8 = 4;

    /// 初始化配置对象
    fun init(ctx: &mut TxContext) {
        let config = PunchCardConfig {
            id: object::new(ctx),
            copper_requirement: 2,
            silver_requirement: 3,
            gold_requirement: 4,
            time_interval: 60,
        };
        let table = PunchCardTable {
            id: object::new(ctx),
            table: table::new(ctx),
            rankings: vec_set::empty(),
            total_users: 0,
        };
        transfer::share_object(table);
        transfer::share_object(config);
    }

    /// 生成随机背景色
    fun generate_background_color(ts: u64): String {
        // 简化实现：根据时间戳选择预定义的颜色
        let color_index = (ts % 8);
        if (color_index == 0) {
            string::utf8(b"rgb(255, 99, 132)")
        } else if (color_index == 1) {
            string::utf8(b"rgb(54, 162, 235)")
        } else if (color_index == 2) {
            string::utf8(b"rgb(255, 205, 86)")
        } else if (color_index == 3) {
            string::utf8(b"rgb(75, 192, 192)")
        } else if (color_index == 4) {
            string::utf8(b"rgb(153, 102, 255)")
        } else if (color_index == 5) {
            string::utf8(b"rgb(255, 159, 64)")
        } else if (color_index == 6) {
            string::utf8(b"rgb(199, 199, 199)")
        } else {
            string::utf8(b"rgb(83, 102, 255)")
        }
    }

    /// 生成SVG图片data url
    fun generate_svg_url(bg: &String, label: &String): String {
        // 简化实现：使用固定的SVG模板
        if (label == &string::utf8(b"铜牌")) {
            string::utf8(b"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='rgb(255, 99, 132)'/><text x='50%' y='50%' font-size='32' text-anchor='middle' fill='white' dy='.3em'>铜牌</text></svg>")
        } else if (label == &string::utf8(b"银牌")) {
            string::utf8(b"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='rgb(54, 162, 235)'/><text x='50%' y='50%' font-size='32' text-anchor='middle' fill='white' dy='.3em'>银牌</text></svg>")
        } else {
            string::utf8(b"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='rgb(255, 205, 86)'/><text x='50%' y='50%' font-size='32' text-anchor='middle' fill='white' dy='.3em'>金牌</text></svg>")
        }
    }

    /// 打卡函数
    public entry fun punch_in(
        table: &mut PunchCardTable,
        config: &PunchCardConfig,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock) / 1000;
        if (!table::contains(&table.table, sender)) {
            let user_info = UserPunchInfo {
                id: object::new(ctx),
                owner: sender,
                count: 0,
                last_punch_time: 0,
                rewards_claimed: 0,
            };
            table::add(&mut table.table, sender, user_info);
            table.total_users = table.total_users + 1;
        };
        let user_info = table::borrow_mut(&mut table.table, sender);
        if (config.time_interval > 0 && now < user_info.last_punch_time + config.time_interval) {
            abort 0x1;
        };
        user_info.count = user_info.count + 1;
        user_info.last_punch_time = now;
        if (!vec_set::contains(&table.rankings, &sender)) {
            vec_set::insert(&mut table.rankings, sender);
        };
        let bg_color = generate_background_color(now);
        // 铜牌
        if (user_info.count >= config.copper_requirement && (user_info.rewards_claimed & COPPER_REWARD) == 0) {
            let image_url = generate_svg_url(&bg_color, &string::utf8(b"铜牌"));
            let nft = CopperNFT {
                id: object::new(ctx),
                owner: sender,
                name: string::utf8(b"铜牌打卡达人"),
                description: string::utf8(b"连续打卡2次获得的铜牌奖励"),
                image_url: image_url,
                background_color: bg_color,
                punch_time: now,
            };
            transfer::transfer(nft, sender);
            user_info.rewards_claimed = user_info.rewards_claimed | COPPER_REWARD;
        };
        // 银牌
        if (user_info.count >= config.silver_requirement && (user_info.rewards_claimed & SILVER_REWARD) == 0) {
            let image_url = generate_svg_url(&bg_color, &string::utf8(b"银牌"));
            let nft = SilverNFT {
                id: object::new(ctx),
                owner: sender,
                name: string::utf8(b"银牌打卡达人"),
                description: string::utf8(b"连续打卡3次获得的银牌奖励"),
                image_url: image_url,
                background_color: bg_color,
                punch_time: now,
            };
            transfer::transfer(nft, sender);
            user_info.rewards_claimed = user_info.rewards_claimed | SILVER_REWARD;
        };
        // 金牌
        if (user_info.count >= config.gold_requirement && (user_info.rewards_claimed & GOLD_REWARD) == 0) {
            let image_url = generate_svg_url(&bg_color, &string::utf8(b"金牌"));
            let nft = GoldNFT {
                id: object::new(ctx),
                owner: sender,
                name: string::utf8(b"金牌打卡达人"),
                description: string::utf8(b"连续打卡4次获得的金牌奖励"),
                image_url: image_url,
                background_color: bg_color,
                punch_time: now,
            };
            transfer::transfer(nft, sender);
            user_info.rewards_claimed = user_info.rewards_claimed | GOLD_REWARD;
        };
    }

    /// 更新配置
    public entry fun update_config(
        config: &mut PunchCardConfig,
        copper_req: u64,
        silver_req: u64,
        gold_req: u64,
        time_int: u64,
        ctx: &mut TxContext
    ) {
        assert!(copper_req > 0, 0x2);
        assert!(silver_req > copper_req, 0x3);
        assert!(gold_req > silver_req, 0x4);
        config.copper_requirement = copper_req;
        config.silver_requirement = silver_req;
        config.gold_requirement = gold_req;
        config.time_interval = time_int;
    }

    /// 查询用户打卡次数
    public fun get_count(table: &PunchCardTable, user: address): u64 {
        if (table::contains(&table.table, user)) {
            let info = table::borrow(&table.table, user);
            info.count
        } else {
            0
        }
    }

    /// 获取用户完整记录
    public fun get_user_record(table: &PunchCardTable, user: address): (u64, u64, u8) {
        if (table::contains(&table.table, user)) {
            let info = table::borrow(&table.table, user);
            (info.count, info.last_punch_time, info.rewards_claimed)
        } else {
            (0, 0, 0)
        }
    }

    /// 获取排行榜
    public fun get_leaderboard(table: &PunchCardTable): vector<address> {
        vec_set::into_keys(table.rankings)
    }

    /// 获取用户总数
    public fun get_total_users(table: &PunchCardTable): u64 {
        table.total_users
    }

    // === NFT 相关函数 ===
    public fun get_copper_image_url(nft: &CopperNFT): String { nft.image_url }
    public fun get_silver_image_url(nft: &SilverNFT): String { nft.image_url }
    public fun get_gold_image_url(nft: &GoldNFT): String { nft.image_url }
    public fun get_copper_background_color(nft: &CopperNFT): String { nft.background_color }
    public fun get_silver_background_color(nft: &SilverNFT): String { nft.background_color }
    public fun get_gold_background_color(nft: &GoldNFT): String { nft.background_color }
    public fun get_copper_punch_time(nft: &CopperNFT): u64 { nft.punch_time }
    public fun get_silver_punch_time(nft: &SilverNFT): u64 { nft.punch_time }
    public fun get_gold_punch_time(nft: &GoldNFT): u64 { nft.punch_time }
} 