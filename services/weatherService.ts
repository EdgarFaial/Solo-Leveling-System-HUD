
export interface WeatherData {
  temp: number;
  condition: 'sun' | 'rain' | 'cloud' | 'storm';
  description: string;
}

// Simulação de busca de clima (poderia usar OpenWeather com API Key real)
export const getCurrentWeather = async (): Promise<WeatherData> => {
  // Simula latência de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const conditions: WeatherData['condition'][] = ['sun', 'rain', 'cloud'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  const descriptions = {
    sun: 'Céu limpo. Condições ideais para atividade externa.',
    rain: 'Chuva detectada. Protocolos indoor recomendados.',
    cloud: 'Nublado. Estabilidade térmica moderada.',
    storm: 'Tempestade. Risco biológico elevado. Permaneça em abrigo.'
  };

  return {
    temp: 22 + Math.floor(Math.random() * 10),
    condition: randomCondition,
    description: descriptions[randomCondition]
  };
};
