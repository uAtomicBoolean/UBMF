/**
 * @author Benjamin Guirlet
 * @description
 *      Handler for the command 'play'.
 */


const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, Client } = require( "discord.js" );

const ytdl = require( "ytdl-core" );
const ytsearch = require( "yt-search" );


const slashCommand = new SlashCommandBuilder()
	.setName( "play" )
	.setDescription( "Joue une musique, playlist ou le résultat d'une recherche passée en paramètre" )
	.addStringOption( option =>
		option.setName( "musique" )
			.setDescription( "Lien de la musique/playlist ou une recherche." )
			.setRequired( true )
	);


/**
 * The commands function. It is executed when the slash command is called.
 * @param {CommandInteraction} interaction The interaction generated by the command execution.
 * @param {Client} client The bot's client.
 */
async function execute( interaction, client ) {
	// Checking if the bot is already active.
	let isConnected = false;
	// TODO add a verification to check if the user is in the vocal with the bot.
	//		if the bot is with the user, then we do not connect it.
	if ( client.voice.adapters.length ) {
		// Checking if its with the user here.

		await interaction.reply( "Le bot est déjà dans un salon vocal!" );
		return;
	}

	// Checking is the member is in a voice channel.
	const member = await interaction.guild.members.fetch( interaction.user.id );
	const voiceChannelId = member.voice.channelId;
	if ( !voiceChannelId ) return interaction.reply( "Tu dois être connecté dans un vocal!" );


	// Checking if the argument is an URL or keywords for a search.
	let musicInfo;
	const musicParam = interaction.options.getString( "musique" );
	if ( ytdl.validateURL( musicParam ) ) {
		const songInfo = await ytdl.getBasicInfo( musicParam );
		// Creating a music object to keep the necessary data of the music.
		musicInfo = {
			title: songInfo.videoDetails.title,
			author: songInfo.videoDetails.author.name,
			url: songInfo.videoDetails.video_url,
			thumbnail: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1].url,
			duration: `${Math.floor( songInfo.videoDetails.lengthSeconds / 60 )}:` +
						`${songInfo.videoDetails.lengthSeconds % 60}`,
			lengthSeconds: songInfo.videoDetails.lengthSeconds
		};
	}
	else {
		// If the video is not an URL, then we search using yt-search.
		const song = await videoFinder( musicParam );
		if ( !song ) return interaction.reply( "Aucun résultats pour cette recherche!" );

		musicInfo = {
			title: song.title,
			author: song.author.name,
			url: song.url,
			thumbnail: song.thumbnail,
			duration: song.timestamp,
			lengthSeconds: song.seconds
		};
	}


	// Connecting to the voice chat.
	if ( !isConnected ) {
	}


	client.queue.push( musicInfo );


	await interaction.reply( "oui" );
}


/**
 * Search a video on youtube and return the first result.
 * @param {string} keywords 
 * @returns An object containing the video's data.
 */
async function videoFinder( keywords ) {
	const searchResult = await ytsearch( keywords );
	return searchResult.videos.length > 1 ? searchResult.videos[0] : null;
}


module.exports = {
	data: slashCommand,
	execute
}