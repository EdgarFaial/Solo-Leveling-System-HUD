
export interface GoogleFitData {
  steps: number;
  heartRate: number;
  sleepMinutes: number;
}

export const connectGoogleFit = async (): Promise<GoogleFitData> => {
  // Em uma implementação real, isso usaria gapi.auth2 ou similar
  // Para esta demonstração, simulamos o retorno de dados após um "delay" de conexão
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    steps: 4230,
    heartRate: 72,
    sleepMinutes: 380 // ~6.3h
  };
};
