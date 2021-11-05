/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains utilities functions that may be used multiples times in different files.
 */


const { CommandInteraction, MessageEmbed} = require( "discord.js" );
const { EMBED_COLOR } = require( "../files/config.json" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Check if an user is connected to a voice channel.
 * @param {CommandInteraction} interaction The user's ID.
 * @returns {Promise<string>} Returns the voiceChannelId if the user is connected, else replies to the interaction
 * and returns null.
 */
async function checkUserIsConnected( interaction ) {
	const member = await interaction.guild.members.fetch( interaction.user.id );
	const voiceChannelId = member.voice.channelId;
	if ( !voiceChannelId ) {
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor( EMBED_COLOR )
					.setTitle( "Tu dois être dans un salon vocal pour utiliser cette commande!" )
					.setAuthor( interaction.user.username, interaction.user.avatarURL() )
			]} );
		return null;
	}
	return voiceChannelId;
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	checkUserIsConnected
}