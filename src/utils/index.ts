export const formatUserProfile = (user: any) => {
    return {
      name: user.name,
      birthDate: user.birthDate.toISOString().split('T')[0], // Converte Date para string (formato YYYY-MM-DD)
      cpf: user.cpf,
      phone: user.phone,
      gender: user.gender,
      profile: user.profile,
      history: [], // Array vazio (ou preencha com dados reais se necessário)
      penalties: [], // Array vazio
      list: [], // Array vazio
    };
  };