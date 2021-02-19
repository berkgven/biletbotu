const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const enmap = require('enmap');
const {token, prefix} = require('./config.json');
const categoryID = ("810179947163156511")


const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
});

client.on('ready', () => {
    console.log('ready')
});


client.on('message', async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "setup") {
        // ticket-setup #channel
        
if(!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send("Bu komutu kullanma yetkin yok!")

        let channel = message.mentions.channels.first();
        if(!channel) return message.reply("Kullanımı: `b!setup #kanal`");

        let sent = await channel.send(new Discord.MessageEmbed()
            .setTitle("Öneri Sistemi")
            .setDescription("Öneri bileti oluşturmak için aşağıdaki 📨 emojisine tıkla! **Öneri sistemini gereksiz meşgul etmek yasaktır.** ")
            .setFooter("Öneri sistemi")
            .setColor("8aff14")
        );

        sent.react('📨');
        settings.set(`${message.guild.id}-ticket`, sent.id);

        message.channel.send(new Discord.MessageEmbed()
            .setTitle("Hazırım!")
            .setDescription("Çalışmaya hazırım.")
            .setFooter("berkoyum")
            .setColor("8c00e3")    
    
        );
    }



    if(command == "sil") {
      if(!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send("Bu komutu kullanma yetkin yok!")
        if(!message.channel.name.includes("ticket-")) return message.channel.send("Bu komutu burada kullanamazsın!")
        message.channel.delete();
    }

    if(command == "kapat") {
        if(!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send("Bu komutu kullanma yetkin yok!")
        if(!message.channel.name.includes("ticket-")) return message.channel.send("Bu komutu burada kullanamazsın!")
       
        message.channel.setParent(categoryID) 
        message.channel.setName("kapali-" + message.channel.name)
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.bot) return;
    
    let ticketid = await settings.get(`${reaction.message.guild.id}-ticket`);

    if(!ticketid) return;
    
    
   

    if(reaction.message.id == ticketid && reaction.emoji.name == '📨') {
        reaction.users.remove(user);


     const channel = reaction.message.guild.channels.cache.find(channel => channel.name === 'ticket-' + user.id)

   if(channel) return user.send(new Discord.MessageEmbed().setTitle("Hata!")
   .setDescription("Zaten açık olan bir biletiniz var!")
   .setColor("ff0000"));
   

        reaction.message.guild.channels.create(`ticket-${user.id}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
            channel.send(`<@${user.id}>`, new Discord.MessageEmbed().setTitle("Öneri için açılan siz ve yetkililere özel kanala hoşgeldin.").setDescription("Önerin nedir?").setColor("14c8ff"))
        })
    }
});

client.login(token);
