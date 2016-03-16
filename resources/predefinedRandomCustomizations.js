"use strict";

/*

 Stuff defined here are used in following contexts:

 - As a basis for character customization for the first time
 - Shown in CC client(s) as a show off thing on login page (to encourage people to sign up by showing different CC)
 - Shown in game client(s) as a show off thing on join overview (to encourage people to sign up by showing different CC)
 - Random chars to be shown when user is not logged in

 */


// @formatter:off
const alien = [{"optionId":"1000","color":"#0080FF"},{"optionId":"2016","color":"#FF0000"},{"optionId":"3005","color":"#0000FF"},{"optionId":"4004"},{"optionId":"5010","color":"#FF0000"}];
const mexican = [{"optionId":"1000","color":"#D99958"},{"optionId":"2014","color":"#000000"},{"optionId":"3004","color":"#515158"},{"optionId":"4001"},{"optionId":"7007"}];
const yankee = [{"optionId":"1000","color":"#D99958"},{"optionId":"2006","color":"#579EC9"},{"optionId":"3004","color":"#605240"},{"optionId":"4007"},{"optionId":"7001","color":"#4AD031"}];
const sickWoman = [{"optionId":"1000","color":"#DDDD22"},{"optionId":"2004","color":"#663333"},{"optionId":"3007","color":"#515158"},{"optionId":"4008"},{"optionId":"7005","color":"#FFA2BF"}];
const fartBender = [{"optionId":"1000","color":"#D99958"},{"optionId":"2013","color":"#000000"},{"optionId":"3003","color":"#515158"},{"optionId":"4001"},{"optionId":"5012","color":"#00FFFF"}];
const ottoman1 = [{"optionId":"1000","color":"#D99958"},{"optionId":"2006","color":"#000000"},{"optionId":"3003","color":"#605240"},{"optionId":"4002"},{"optionId":"7012","color":"#EF2D35"}];
const asian = [{"optionId":"1000","color":"#D99958"},{"optionId":"2000"},{"optionId":"3001","color":"#333333"},{"optionId":"4003"},{"optionId":"7003"}];
const sunBurn = [{"optionId":"1000","color":"#AA4E31"},{"optionId":"2009","color":"#FF0000"},{"optionId":"3006","color":"#FF0000"},{"optionId":"4000"},{"optionId":"7013","color":"#FFFFFF"}];
const cartman = [{"optionId":"1000","color":"#D99958"},{"optionId":"2012"},{"optionId":"3003","color":"#515158"},{"optionId":"4009"},{"optionId":"7006"}];
const takke = [{"optionId":"1000","color":"#D99958"},{"optionId":"2002","color":"#57C957"},{"optionId":"3004","color":"#605240"},{"optionId":"4001"},{"optionId":"7008"}];
const emo = [{"optionId":"1000","color":"#D99958"},{"optionId":"2002","color":"#000000"},{"optionId":"3000","color":"#515158"},{"optionId":"4004"},{"optionId":"5011","color":"#515158"}];
const zombie = [{"optionId":"1000","color":"#D99958"},{"optionId":"2020"},{"optionId":"3002","color":"#515158"},{"optionId":"4000"}];
const smurf = [{"optionId":"1000","color":"#0080FF"},{"optionId":"2012"},{"optionId":"3007","color":"#515158"},{"optionId":"4005"},{"optionId":"5004","color":"#333333"},{"optionId":"7015","color":"#3A3A3A"}];
const methHead = [{"optionId":"1000","color":"#DDDD22"},{"optionId":"2017","color":"#579EC9"},{"optionId":"3007","color":"#857051"},{"optionId":"4011"},{"optionId":"5005","color":"#515158"}];
const stewie = [{"optionId":"1000","color":"#D99958"},{"optionId":"2009","color":"#000000"},{"optionId":"3000","color":"#515158"},{"optionId":"4009"},{"optionId":"5002","color":"#515158"}];
const ottoman2 = [{"optionId":"1000","color":"#D99958"},{"optionId":"2002","color":"#663333"},{"optionId":"3004","color":"#333333"},{"optionId":"4012"},{"optionId":"7003"}];

const random01 = [{"optionId":"1000","color":"#D99958"},{"optionId":"2005","color":"#FF0000"},{"optionId":"3008","color":"#FFFFFF"},{"optionId":"4003"},{"optionId":"5001","color":"#FFFFFF"}];
const random02 = [{"optionId":"1000","color":"#706250"},{"optionId":"2015"},{"optionId":"3006","color":"#0000FF"},{"optionId":"4010"},{"optionId":"7004","color":"#B12592"}];
const random03 = [{"optionId":"1000","color":"#C0C0C0"},{"optionId":"2015"},{"optionId":"3005","color":"#00FFFF"},{"optionId":"4000"},{"optionId":"5006","color":"#FF0000"},{"optionId":"7011","color":"#4AD031"}];
const random04 = [{"optionId":"1000","color":"#C0C0C0"},{"optionId":"2019"},{"optionId":"3002","color":"#DDDD22"},{"optionId":"4004"},{"optionId":"5006","color":"#FF0000"},{"optionId":"7011","color":"#00A2C2"}];
const random05 = [{"optionId":"1000","color":"#27160E"},{"optionId":"2007","color":"#FF0000"},{"optionId":"3007","color":"#333333"},{"optionId":"4000"}];
const random06 = [{"optionId":"1000","color":"#A27D47"},{"optionId":"2004","color":"#57C957"},{"optionId":"3008","color":"#FF0000"},{"optionId":"4000"},{"optionId":"7009"}];
const random07 = [{"optionId":"1000","color":"#AA4E31"},{"optionId":"2004","color":"#57C957"},{"optionId":"3002","color":"#DDDD22"},{"optionId":"4000"},{"optionId":"5011","color":"#00FF00"},{"optionId":"7005","color":"#EF2D35"}];
const random08 = [{"optionId":"1000","color":"#DDDD22"},{"optionId":"2016","color":"#000000"},{"optionId":"3008","color":"#FF0000"},{"optionId":"4000"},{"optionId":"5008","color":"#FF0000"}];
// @formatter:on

module.exports = [
    alien, mexican, yankee, sickWoman, fartBender, ottoman1, asian, sunBurn, cartman, takke, emo, zombie, smurf, methHead, stewie, ottoman2,
    random01, random02, random03, random04, random05, random06, random07, random08
];
