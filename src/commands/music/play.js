/**
 * @author Benjamin Guirlet
 * @description
 *      Handler for the command 'play'.
 */


const { EMBED_COLOR } = require( "../../files/config.json" );
const { checkUserIsConnected } = require( "../../utils/utils" );
const { getIntDate } = require( "../../utils/utils" );

const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, Client, MessageEmbed } = require( "discord.js" );

const ytdl = require( "ytdl-core" );
const youtubedl = require( "youtube-dl-exec" ).raw;
const ytsearch = require( "yt-search" );
const dvoice = require( '@discordjs/voice' );



const slashCommand = new SlashCommandBuilder()
	.setName( "play" )
	.setDescription( "Joue une musique, playlist ou le résultat d'une recherche passée en paramètre" )
	.addStringOption( option =>
		option.setName( "music" )
			.setDescription( "Lien de la musique/playlist ou une recherche." )
			.setRequired( true )
	);


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * The commands function. It is executed when the slash command is called.
 * @param {CommandInteraction} interaction The interaction generated by the command execution.
 * @param {Client} client The bot's client.
 */
async function execute( interaction, client ) {
	// Starting by checking is the user is in a voice channel.
	const voiceChannelId = await checkUserIsConnected( interaction )
	if ( !voiceChannelId ) return;



	const guildId = interaction.guildId;
	const params = interaction.options.getString( "music" );

	// Checking if the bot and the user are in the same vocal channel to avoid people interacting with the bot unless
	// its with them.
	if ( client.guildsData.has( guildId ) ) {
		if ( voiceChannelId !== client.guildsData.get( guildId ).voiceChannelId )
			return interaction.reply( "Vous devez être dans le même salon que le bot" );

		const musicInfo = await getMusicInfo( params, interaction.user.avatarURL() );
		if ( !musicInfo ) return interaction.reply( `**Aucun résultats trouvés avec :** ${params}` );

		// Adding the music to the queue.
		client.guildsData.get( guildId ).queue.push( musicInfo );
		return interaction.reply( { embeds: [getQueueMusicEmbed( musicInfo )] } );
	}
	else { // In this case, we have to completely start the player.
		const musicInfo = await getMusicInfo( params, interaction.user.avatarURL() );
		if ( !musicInfo ) return interaction.reply( `**Aucun résultats trouvés avec :** ${params}` );

		// Creating the guild's data to add later in client.guildsData.
		let guildData = {
			connection: dvoice.joinVoiceChannel(
				{
					channelId: voiceChannelId,
					guildId: interaction.guildId,
					adapterCreator: interaction.guild.voiceAdapterCreator
				}
			),
			player: dvoice.createAudioPlayer(),
			voiceChannelId: voiceChannelId,
			commandChannel: await client.channels.fetch( interaction.channelId ),
			queue: [ musicInfo ]
		}
		guildData.connection.subscribe( guildData.player );

		// Added this block to manage disconnections.
		// Taken from https://discordjs.guide/voice/voice-connections.html#handling-disconnects
		guildData.connection.on( dvoice.VoiceConnectionStatus.Disconnected, async () => {
			try {
				await Promise.race([
					dvoice.entersState(guildData.connection, dvoice.VoiceConnectionStatus.Signalling, 5_000),
					dvoice.entersState(guildData.connection, dvoice.VoiceConnectionStatus.Connecting, 5_000),
				]);
				// Seems to be reconnecting to a new channel - ignore disconnect
			} catch (error) {
				// Seems to be a real disconnect which SHOULDN'T be recovered from
				client.guildsData.delete( guildId );
				guildData.connection.destroy();
			}
		});

		client.guildsData.set( guildId, guildData );
		client.guildsData.get( guildId ).player.on( dvoice.AudioPlayerStatus.Idle, () => {
			playSong( guildId, client.guildsData );
		});

		await interaction.reply( "Chargement de la musique..." );
		await interaction.deleteReply();
		playSong( interaction.guildId, client.guildsData );
	}
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


/**
 * Get the music's information in function of the source of the search (url or keywords). Then puts the information in
 * an object and returns it.
 * @param {string} param The URL or keywords search for the music.
 * @param {string} userAvatarUrl The user's avatar URL to display it in the embed.
 */
async function getMusicInfo( param, userAvatarUrl ) {
	if ( ytdl.validateURL( param ) )
		return await getSongInfoFromUrl( param, userAvatarUrl );
	else
		return await getSongInfoFromSearch( param, userAvatarUrl );
}


/**
 * Get the song information when the user gave an url.
 * @param {string} songUrl The url of the youtube video.
 * @param {string} userAvatarUrl The user's avatar URL to display it in the embed.
 * @returns {Promise<{duration: string, thumbnail: *, author: string, lengthSeconds: string, title: string, url: string}>}
 */
async function getSongInfoFromUrl( songUrl, userAvatarUrl ) {
	const songInfo = await ytdl.getBasicInfo( songUrl );
	return {
		title: songInfo.videoDetails.title,
		author: songInfo.videoDetails.author.name,
		url: songInfo.videoDetails.video_url,
		thumbnail: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1].url,
		duration: `${Math.floor( songInfo.videoDetails.lengthSeconds / 60 )}:` +
			`${songInfo.videoDetails.lengthSeconds % 60}`,
		lengthSeconds: songInfo.videoDetails.lengthSeconds,
		userAvatarUrl: userAvatarUrl
	};
}


/**
 * Get the song information when the user gave a search.
 * @param {string} searchKeywords The search entered by the user.
 * @param {string} userAvatarUrl The user's avatar URL to display it in the embed.
 * @returns {Promise<{duration, thumbnail: *, author, lengthSeconds: (number|*), title, url}|null>}
 */
async function getSongInfoFromSearch( searchKeywords, userAvatarUrl ) {
	// If the video is not an URL, then we search using yt-search.
	const song = await videoFinder( searchKeywords );
	if ( !song ) return null;

	return {
		title: song.title,
		author: song.author.name,
		url: song.url,
		thumbnail: song.thumbnail,
		duration: song.timestamp,
		lengthSeconds: song.seconds,
		userAvatarUrl: userAvatarUrl
	};
}


/**
 * Play the first song of the guild's queue or destroy the voiceConnection if the queue is empty.
 * @param {string} guildId The discord Id of the guild where the command play was executed.
 * @param {Map} guildsData An object with the guild's data. Check 'src/index.js' to see its attributes.
 * to see its attributes.
 */
function playSong( guildId, guildsData ) {
	const guildData = guildsData.get( guildId );

	if ( guildData.queue.length === 0 ) {
		guildData.connection.destroy();
		guildsData.delete( guildId );
		return;
	}

	const musicInfo = guildData.queue.shift();
	guildData.currentSong = musicInfo;
	const stream = youtubedl(musicInfo.url, {
		o: '-',
		q: '',
		f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
		r: '100K',
	}, { stdio: ['ignore', 'pipe', 'ignore'] });

	guildsData.get( guildId ).player.on( dvoice.AudioPlayerStatus.Playing, () => {
		guildData.currentSong.intDate = getIntDate();
	});
	guildsData.get( guildId ).player.play( dvoice.createAudioResource( stream.stdout ) );

	guildData.commandChannel.send( { embeds: [getPlayMusicEmbed( musicInfo )] } );
}


function getQueueMusicEmbed( musicInfo ) {
	return new MessageEmbed()
		.setColor( EMBED_COLOR )
		.setAuthor( "| Music added to the queue", musicInfo.userAvatarUrl )
		.setThumbnail( musicInfo.thumbnail )
		.setDescription(
			`[${musicInfo.title}](${musicInfo.url}) by ${musicInfo.author} [${musicInfo.duration}]`
		);
}


function getPlayMusicEmbed( musicInfo ) {
	return new MessageEmbed()
		.setColor( EMBED_COLOR )
		.setAuthor( "| Now playing", musicInfo.userAvatarUrl )
		.setThumbnail( musicInfo.thumbnail )
		.setDescription(
			`[${musicInfo.title}](${musicInfo.url}) by ${musicInfo.author} [${musicInfo.duration}]`
		);
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}