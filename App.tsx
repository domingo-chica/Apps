import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, STORIES, LANGUAGE_CONFIG, PLAYBACK_RATES, VOICES, AVATARS } from './constants';
import { generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';
import { PlayIcon, StopIcon, SpinnerIcon } from './components/icons';
import { Profile } from './types';
import InteractiveIllustration from './components/InteractiveIllustration';


// StoryView Component
const StoryView: React.FC<{ profile: Profile; onUpdatePreferences: (prefs: Partial<Profile['preferences']>) => void; onLogout: () => void; }> = ({ profile, onUpdatePreferences, onLogout }) => {
  const { preferences } = profile;
  const [language, setLanguage] = useState<Language>(preferences.language);
  const [voice, setVoice] = useState<string>(preferences.voice);
  const [playbackRate, setPlaybackRate] = useState<number>(preferences.playbackRate);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  
  const updatePref = useCallback((newPrefs: Partial<Profile['preferences']>) => {
    onUpdatePreferences(newPrefs);
  }, [onUpdatePreferences]);

  useEffect(() => {
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if(AudioContext) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        document.removeEventListener('click', initAudioContext);
    };
    document.addEventListener('click', initAudioContext);
    return () => {
        document.removeEventListener('click', initAudioContext);
        audioContextRef.current?.close();
    };
  }, []);

  const handleStop = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    handleStop();
  }, [language, voice, handleStop]);

  useEffect(() => {
      if (audioSourceRef.current) {
          audioSourceRef.current.playbackRate.value = playbackRate;
      }
  }, [playbackRate]);

  const playAudio = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    handleStop();
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlaying(false);
    source.start(0);
    audioSourceRef.current = source;
    setIsPlaying(true);
  };

  const handlePlay = async () => {
    if (isLoading) return;
    if (isPlaying) return handleStop();
    if (!audioContextRef.current) {
        setError("Audio context not initialized. Please click anywhere on the page first.");
        return;
    }
    setError(null);

    const cacheKey = `${language}-${voice}`;
    const cachedBuffer = audioBuffersRef.current[cacheKey];
    if (cachedBuffer) {
      playAudio(cachedBuffer);
    } else {
      setIsLoading(true);
      try {
        const currentStoryContent = STORIES[language].content;
        const base64Audio = await generateSpeech(currentStoryContent, voice);
        
        if (base64Audio && audioContextRef.current) {
          const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
          audioBuffersRef.current[cacheKey] = buffer;
          playAudio(buffer);
        } else {
          throw new Error("Failed to generate audio.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentStory = STORIES[language];

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] duration-500">
      <header className="p-6 bg-orange-400 text-white text-center flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">Cuentos San José</h1>
         <button onClick={onLogout} className="text-sm bg-white/20 hover:bg-white/40 text-white font-bold py-2 px-3 rounded-full transition-colors">
            {profile.avatar} {profile.name}
         </button>
      </header>

      <main className="p-6 md:p-8 space-y-6">
        <InteractiveIllustration />
        <div className="text-center">
           <h2 className="text-2xl font-bold text-gray-800">{currentStory.title}</h2>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl max-h-40 overflow-y-auto text-gray-600 leading-relaxed text-justify">
          <p>{currentStory.content}</p>
        </div>
      </main>
      
      <footer className="p-6 bg-gray-100 border-t border-gray-200 space-y-6">
          {error && <div className="text-red-500 text-center p-2 bg-red-100 rounded-lg">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="w-full">
                  <label className="block text-sm font-bold text-gray-600 mb-2 text-center">Idioma</label>
                  <div className="flex items-center justify-center bg-white p-1 rounded-full shadow-inner">
                      {Object.values(Language).map((lang) => (
                          <button
                              key={lang}
                              onClick={() => { setLanguage(lang); updatePref({ language: lang }); }}
                              className={`w-full px-4 py-2 text-2xl rounded-full transition-colors duration-300 ${language === lang ? 'bg-orange-400 text-white shadow' : 'text-gray-500 hover:bg-orange-100'}`}
                              title={LANGUAGE_CONFIG[lang].name}
                          >
                              {LANGUAGE_CONFIG[lang].flag}
                          </button>
                      ))}
                  </div>
              </div>
              <div className="w-full">
                  <label className="block text-sm font-bold text-gray-600 mb-2 text-center">Voz</label>
                  <div className="flex items-center justify-center bg-white p-1 rounded-full shadow-inner">
                      {VOICES.map((v) => (
                          <button
                              key={v.id}
                              onClick={() => { setVoice(v.id); updatePref({ voice: v.id }); }}
                              className={`w-full px-3 py-2 text-xs font-bold rounded-full transition-colors duration-300 ${voice === v.id ? 'bg-orange-400 text-white shadow' : 'text-gray-600 hover:bg-orange-100'}`}
                          >
                              {v.name}
                          </button>
                      ))}
                  </div>
              </div>
               <div className="w-full">
                   <label className="block text-sm font-bold text-gray-600 mb-2 text-center">Velocidad</label>
                  <div className="flex items-center justify-center bg-white p-1 rounded-full shadow-inner">
                      {PLAYBACK_RATES.map((rate) => (
                          <button
                              key={rate}
                              onClick={() => { setPlaybackRate(rate); updatePref({ playbackRate: rate }); }}
                              className={`w-full px-3 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${playbackRate === rate ? 'bg-orange-400 text-white shadow' : 'text-gray-600 hover:bg-orange-100'}`}
                          >
                              {rate}x
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          <div className="flex justify-center mt-4">
              <button
                  onClick={handlePlay}
                  disabled={isLoading}
                  className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                  aria-label={isPlaying ? "Stop" : "Play"}
              >
                  {isLoading ? <SpinnerIcon /> : isPlaying ? <StopIcon /> : <PlayIcon />}
              </button>
          </div>
      </footer>
    </div>
  );
};


// Profile Management Components & Main App
const App: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [newName, setNewName] = useState('');
    const [newAvatar, setNewAvatar] = useState(AVATARS[0]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('cuentos-profiles');
            const loadedProfiles = saved ? JSON.parse(saved) : [];
            setProfiles(loadedProfiles);
            if(loadedProfiles.length === 0) setIsCreating(true);
        } catch (e) { console.error("Could not load profiles.", e); }
    }, []);

    const saveProfiles = (updatedProfiles: Profile[]) => {
        setProfiles(updatedProfiles);
        localStorage.setItem('cuentos-profiles', JSON.stringify(updatedProfiles));
    };

    const handleCreateProfile = () => {
        if (!newName.trim()) return;
        const newProfile: Profile = {
            id: Date.now().toString(),
            name: newName,
            avatar: newAvatar,
            preferences: {
                language: Language.Spanish,
                playbackRate: 1,
                voice: VOICES[0].id,
            },
        };
        saveProfiles([...profiles, newProfile]);
        setCurrentProfile(newProfile);
        setIsCreating(false);
        setNewName('');
    };
    
    const handleUpdatePreferences = (newPrefs: Partial<Profile['preferences']>) => {
        if (!currentProfile) return;
        const updatedProfile = {
            ...currentProfile,
            preferences: { ...currentProfile.preferences, ...newPrefs },
        };
        setCurrentProfile(updatedProfile);
        saveProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    };

    if (currentProfile) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-100 to-orange-200">
            <StoryView profile={currentProfile} onUpdatePreferences={handleUpdatePreferences} onLogout={() => setCurrentProfile(null)} />
          </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Cuentos San José</h1>
                {isCreating ? (
                    <>
                        <h2 className="text-xl text-gray-600 mb-6">Crea tu perfil</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">1. Elige tu amigo</label>
                            <div className="flex flex-wrap justify-center gap-2 bg-gray-100 p-3 rounded-xl">
                                {AVATARS.map(avatar => (
                                    <button key={avatar} onClick={() => setNewAvatar(avatar)} className={`text-4xl p-2 rounded-full transition-transform transform hover:scale-125 ${newAvatar === avatar ? 'bg-orange-300' : ''}`}>
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">2. Escribe tu nombre</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Tu nombre"
                                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center"
                            />
                        </div>
                        <button onClick={handleCreateProfile} disabled={!newName.trim()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full text-lg disabled:bg-gray-400 transition-colors">
                            ¡A leer!
                        </button>
                         {profiles.length > 0 && <button onClick={() => setIsCreating(false)} className="mt-2 text-sm text-gray-500 hover:underline">Cancelar</button>}
                    </>
                ) : (
                    <>
                       <h2 className="text-xl text-gray-600 mb-6">¿Quién está leyendo?</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            {profiles.map(p => (
                                <button key={p.id} onClick={() => setCurrentProfile(p)} className="text-center group">
                                    <div className="text-6xl bg-gray-100 p-4 rounded-full group-hover:bg-orange-200 transition-colors">{p.avatar}</div>
                                    <p className="mt-2 font-bold text-gray-700">{p.name}</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsCreating(true)} className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
                            + Añadir perfil
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};


export default App;
