"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommandBase = void 0;
class SlashCommandBase {
    constructor(client, options) {
        var _a, _b, _c;
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.options = (_a = options.options) !== null && _a !== void 0 ? _a : [];
        this.subcommands = (_c = (_b = options.subcommands) === null || _b === void 0 ? void 0 : _b.map(subcommand => subcommand.makeSubcommand())) !== null && _c !== void 0 ? _c : [];
        this.isSubcommand = false;
        this.required_permissions = options.permissions;
    }
    run(optionNames, interaction) {
        const subcommand = optionNames.length ? this.subcommands.find(subcommand => subcommand.name == optionNames[0]) : null;
        optionNames.shift();
        if (!subcommand) {
            let passed = this.permissionCheck(interaction).passed && this.prechecks(interaction).passed;
            if (passed)
                this.execute(interaction);
            else
                return;
        }
        else
            subcommand.run(optionNames, interaction);
    }
    permissionCheck(interaction) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (!this.required_permissions || ((_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.isDMBased()))
            return { passed: true };
        const required_author_permissions = this.required_permissions.author;
        const required_bot_permissions = this.required_permissions.author;
        const author = interaction.member;
        const bot = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.get(((_c = this.client.user) === null || _c === void 0 ? void 0 : _c.id) || "");
        if ((required_author_permissions === null || required_author_permissions === void 0 ? void 0 : required_author_permissions.guild) && !author.permissions.has(required_author_permissions.guild)) {
            (_d = interaction.channel) === null || _d === void 0 ? void 0 : _d.send("invalid author guild perms");
        }
        // @ts-ignore
        if ((required_author_permissions === null || required_author_permissions === void 0 ? void 0 : required_author_permissions.channel) && !((_e = interaction.channel) === null || _e === void 0 ? void 0 : _e.permissionsFor(author.id).has(required_author_permissions.channel))) {
            (_f = interaction.channel) === null || _f === void 0 ? void 0 : _f.send("invalid author channel perms");
        }
        if ((required_bot_permissions === null || required_bot_permissions === void 0 ? void 0 : required_bot_permissions.guild) && !bot.permissions.has(required_bot_permissions.guild)) {
            (_g = interaction.channel) === null || _g === void 0 ? void 0 : _g.send("invalid bot guild perms");
        }
        // @ts-ignore
        if ((required_bot_permissions === null || required_bot_permissions === void 0 ? void 0 : required_bot_permissions.channel) && !((_h = interaction.channel) === null || _h === void 0 ? void 0 : _h.permissionsFor(bot.id).has(required_bot_permissions.channel))) {
            (_j = interaction.channel) === null || _j === void 0 ? void 0 : _j.send("invalid bot channel perms");
        }
        return { passed: true };
    }
    prechecks(interaction) {
        return { passed: true };
    }
    execute(interaction) {
        return interaction.reply({ embeds: [this.client.toolbox.simpleEmbed("This command is missing an execute function!")] });
    }
    getData() {
        const { name, description, options, subcommands } = this;
        const json = {
            name, description,
            options: [...options.map(option => this.getOptionData(option)), ...subcommands.map(subcommand => subcommand.getData())]
        };
        if (this.getType())
            json.type = this.getType();
        //if (this.user_permissions.length) json.default_member_permissions = new PermissionsBitField(this.user_permissions).bitfield
        return json;
    }
    getJSON() {
        const { name, description, options, subcommands } = this;
        const json = {
            name, description,
            options: [...options.map(option => this.getOptionJSON(option)), ...subcommands.map(subcommand => subcommand.getJSON())]
        };
        if (this.getType())
            json.type = this.getType();
        //if (this.user_permissions.length) json.default_member_permissions = new PermissionsBitField(this.user_permissions).bitfield
        return json;
    }
    getOptionJSON(option) {
        const { name, description, required, choices, channel_types, min_value, max_value, autocomplete, type } = option;
        const json = { name, description, type };
        if (required)
            json.required = required;
        if (choices)
            json.choices = choices;
        if (channel_types === null || channel_types === void 0 ? void 0 : channel_types.length)
            json.channel_types = channel_types;
        if (min_value)
            json.min_value = min_value;
        if (max_value)
            json.max_value = max_value;
        if (autocomplete)
            json.autocomplete = autocomplete;
        return json;
    }
    getOptionData(option) {
        const { name, description, required, choices, channel_types, min_value, max_value, autocomplete } = option;
        const type = this.getOptionTypeValue(option.type);
        const json = { name, description, type };
        if (required)
            json.required = required;
        if (choices)
            json.choices = choices;
        if (channel_types === null || channel_types === void 0 ? void 0 : channel_types.length)
            json.channel_types = channel_types.map(this.getOptionTypeValue);
        if (min_value)
            json.min_value = min_value;
        if (max_value)
            json.max_value = max_value;
        if (autocomplete)
            json.autocomplete = autocomplete;
        return json;
    }
    getOptionTypeValue(type) {
        const typeValues = {
            "STRING": 3, "INTEGER": 4, "BOOLEAN": 5, "USER": 6,
            "CHANNEL": 7, "ROLE": 8, "MENTIONABLE": 9, "NUMBER": 10,
            "ATTACHMENT": 11, "GUILD_TEXT": 0, "DM": 1, "GUILD_VOICE": 2,
            "GROUP_DM": 3, "GUILD_CATEGORY": 4, "GUILD_NEWS": 5, "GUILD_NEWS_THREAD": 10,
            "GUILD_PUBLIC_THREAD": 11, "GUILD_PRIVATE_THREAD": 12, "GUILD_STAGE_VOICE": 13, "GUILD_DIRECTORY": 14,
        };
        return typeValues[type];
    }
    getType() {
        if (!this.subcommands.length && this.isSubcommand)
            return 1;
        else if (this.subcommands.length && this.isSubcommand)
            return 2;
        else
            return undefined;
    }
    makeSubcommand() {
        this.isSubcommand = true;
        return this;
    }
}
exports.SlashCommandBase = SlashCommandBase;
