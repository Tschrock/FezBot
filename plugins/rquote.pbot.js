var api;

//// Try to prevent responding to messages send before we connected
var startTime;
var msBeforeStart = 1000;
var previousMessages = [];
function checkMessage(data) {
    if (previousMessages.indexOf(data.id) === -1) {
        return true && Date.now() - startTime > msBeforeStart;
    } else {
        previousMessages.push(data.id);
        if (previousMessages.length > 50) {
            previousMessages.shift();
        }
        return false;
    }
}
////

minTimeBetweenMsg = 10000;
lastMsgTime = Date.now();

function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(data, true);
}

list = [
                    //FS
                    "No... I mean, yes... or, actually, kind of.",
                    "... think he's up to the task, mabey... but... but... <sub>no.</sub>",
                    "Oh you poor poor little baby.",
                    "Now this might hurt for juuust a second.",
                    "Oh, well, better late than never, right?",
                    "Lets go! || ...Um, lets, not?",
                    "How dare you? HOW. DARE. YOU?!",
                    "Now what do you have to say for yourself? I Said, What do you have to say for yourself!?",
                    "I don't wanna talk about it.",
                    "Oh, I'm sorry. Uh, am I interupting?",
                    "Were we arguing? I'm sorry.",
                    "Did you see that? I was so assertive.",
                    "It's a game about who can be quiet the longest. Sound fun?",
                    "I'm the world champ you know; I bet you can't beat me. *squee*",
                    "Oh, I'm so frustrated I could just kick something. *ting*",
                    "But, ah, you know, um, whatever you wanna do is fine.",
                    "I am so frusterated I could just scream. <sub>Ahhhahhhhhhhahhhh</sub>",
                    "Oh, right, I'm late. ... ... ... ...  Oh, ok then, see you later.",
                    "I'd like to be a tree.",
                    "It's ok, I promise not to hurt you, I just want to be your... friend?",
                    "You're going to LOVE ME!!!!",
                    "What's soaking wet and clueless? ... Your face!",
                    "I'll catch you yet, my pretties. Oh yes. As soon as one of you little birds or monkeys or bears touches this net, you'll be mine! MINE! *maniacal laughter*",
                    //PP
                    "Oatmeal!? Are you crazy?",
                    "Are you loco in the coco?",
                    "Ha-ha, just kidding. OR AM I?!?!? Sometimes I can't even tell!",
                    "I don't like it. I don't like it one bit.",
                    //"And thats how Equestria was made.",
                    "Eternal chaos come with chocolate rain, you guys! CHOCOLATE! RAIN!",
                    "You shouldn't hit the books, you should really just read them.",
                    "Thanks, guys. You're all great friends too. Even when <i>I</i> don't understand me.",
                    "Forrrreeeeverrrr!",
                    "And what are you laughin' at?!",
                    //R
                    "I thought we agreed to never speak of it again.",
                    "Of all the worst things that could happen, this is THE. WORST. POSSIBLE. THING!",
                    "But I thought you wanted whining!",
                    "Whining? I am <i>not</i> whining. I am complaining. Do you want to hear whining? <i>Thiiis iiis whiiining!</i>",
                    "You know, there's messy, and then there's just plain <i>rude.</i>",
                    "Exiled! I suppose technically I'd have to move away to live in exile ... Where would I go? And what would I pack? Oh, it's going to take me forever to do all of that packing. What are you supposed to pack when you go into exile? You're supposed to pack ... warm?",
                    //TS
                    "All the ponies in this town are CRAZY!!!",
                    "Get back all of you! This is MY BOOK and I'm going to READ IT!",
                    "AJ, I think you're beating a dead.....tree.",
                    "Does this count as camping?",
                    "Cross my heart and hope to fly, stick a cupcake in my— (poke) AARGH!",
                    //AJ
                    "Don't you use your fancy mathematics to muddy the issue!",
                    "Can't hear you, I'm asleep. *fake snoring noises*",
                    "You know, there's fussy, and there's just plain <i>gettin' on my nerves</i>.",
                    //RD
                    "*gasp* OhmygoshohmygoshohmygoshohmygoshohMYGOSH!",
                    "I'm just glad I haven't been replaced by a bucket of turnips.",
                    //S
                    "Can you do that? Can you explode twice?!",
                    //SB
                    "Oh come on!",
                    //AB
                    "YOU TOUCH IT, YOU BUY IT! We take cash or credit.",
                    "I'm gonna get it eventually but... AH WANT IT NOOOWWW!",
                    //S
                    "Don't call me things I don't know the meaning of!",
                    //D
                    "I just dont know what went wrong!",
                    //Mix
                    "That's not a real story. You made it up! || It is a ghost story. They're <i>all</i> made up.",
                    "Um, that doesn't look like a table. || We were making a table? ",
                    'It just needs a little, uh, TLC. || TLC as in "Tender Loving Care" or "Totally Lost Cause"?',
                    "Cool...if you were actually victory-ful at something! || That's not a word! || What are you, a dictionary?",
                    //PF
                    "Nervous? Don’t be ridiculous. You’re only facing a large crowd of ponies who will be watching your every move and silently judging you.",
                    "I have been looking for you everywhere. We have the thing at the place!",
                    //Misc
                    "This afternoon? As in 'this afternoon' this afternoon?",
                    "*Insert random funny quote here*"
                ];

function handleMessage(data, whisper) {
    if (checkMessage(data)) {

        if (data.msg.toLowerCase().startsWith("!mlpquote")) {
            if (Date.now() - lastMsgTime > minTimeBetweenMsg) {
                lastMsgTime = Date.now();
                sendMessage(list[Math.floor(Math.random() * list.length)], whisper ? data.username : undefined);
            }
        }
    }
}

function sendMessage(txt, whisperUser) {
    if (typeof whisperUser !== 'undefined') {
        api.Messages.whisper(whisperUser, txt);
    } else {
        api.Messages.send(txt);
    }
}

module.exports = {
    meta_inf: {
        name: "rquote",
        version: "1.0.0",
        description: "Shows a random quote",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        startTime = Date.now();
        api.Events.on("userMsg", newMessage);
        api.Events.on("whisper", newWhisper);
    },
    stop: function () {
        api.Events.removeListener("userMsg", newMessage);
        api.Events.removeListener("whisper", newWhisper);
    }
}