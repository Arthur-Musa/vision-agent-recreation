import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Camera, Loader2, CheckCircle } from 'lucide-react';
import { n8nWorkflowService, SinistroBaseData, WorkflowResponse } from '@/services/n8nWorkflowService';

interface FormularioSinistroProps {
  onSinistroCreated?: (response: WorkflowResponse) => void;
}

interface FormData extends SinistroBaseData {
  documentos: FileList | null;
  fotos: FileList | null;
  gravidade_lesao?: 'leve' | 'moderada' | 'grave';
  tipo_transporte?: 'aereo' | 'terrestre' | 'maritimo';
  origem?: string;
  destino?: string;
  transportadora?: string;
}

export const FormularioSinistro: React.FC<FormularioSinistroProps> = ({ onSinistroCreated }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const tipoSinistro = watch('tipo_sinistro');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Primeiro, inicia a triagem
      const triagemResponse = await n8nWorkflowService.iniciarTriagem({
        numero_apolice: data.numero_apolice,
        cpf_segurado: data.cpf_segurado,
        tipo_sinistro: data.tipo_sinistro,
        data_ocorrencia: data.data_ocorrencia,
        descricao_ocorrencia: data.descricao_ocorrencia,
        valor_estimado: data.valor_estimado,
        contato_email: data.contato_email,
        contato_telefone: data.contato_telefone,
      });

      // Depois processa conforme o tipo
      let finalResponse: WorkflowResponse;
      
      if (data.tipo_sinistro === 'acidentes_pessoais') {
        finalResponse = await n8nWorkflowService.processarAcidentesPessoais({
          ...data,
          tipo_sinistro: 'acidentes_pessoais',
          documentos_medicos: [], // Implementar upload
          fotos_lesoes: [], // Implementar upload
          gravidade_lesao: data.gravidade_lesao || 'leve'
        });
      } else {
        finalResponse = await n8nWorkflowService.processarBagagemMercadoria({
          ...data,
          tipo_sinistro: 'bagagem_mercadoria',
          documentos_carga: [], // Implementar upload
          fotos_danos: [], // Implementar upload
          tipo_transporte: data.tipo_transporte || 'terrestre',
          origem: data.origem || '',
          destino: data.destino || '',
          transportadora: data.transportadora || ''
        });
      }

      toast({
        title: "Sinistro criado com sucesso!",
        description: `Número do sinistro: ${finalResponse.numero_sinistro}`,
      });

      if (onSinistroCreated) {
        onSinistroCreated(finalResponse);
      }

      setStep(3); // Tela de sucesso
    } catch (error) {
      console.error('Erro ao criar sinistro:', error);
      toast({
        title: "Erro ao criar sinistro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 3) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-green-700">Sinistro Enviado!</h2>
            <p className="text-muted-foreground">
              Seu sinistro foi recebido e está sendo processado automaticamente.
              Você receberá atualizações por email e SMS.
            </p>
            <Button onClick={() => setStep(1)} variant="outline">
              Criar Novo Sinistro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Abertura de Sinistro - 88i Seguradora</CardTitle>
        <div className="flex space-x-2">
          <div className={`h-2 w-1/2 rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-1/2 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_apolice">Número da Apólice</Label>
                  <Input
                    id="numero_apolice"
                    {...register('numero_apolice', { required: 'Campo obrigatório' })}
                    placeholder="88I2025001234"
                  />
                  {errors.numero_apolice && (
                    <p className="text-sm text-red-500">{errors.numero_apolice.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cpf_segurado">CPF do Segurado</Label>
                  <Input
                    id="cpf_segurado"
                    {...register('cpf_segurado', { required: 'Campo obrigatório' })}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf_segurado && (
                    <p className="text-sm text-red-500">{errors.cpf_segurado.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipo_sinistro">Tipo de Sinistro</Label>
                  <Select onValueChange={(value) => setValue('tipo_sinistro', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acidentes_pessoais">Acidentes Pessoais</SelectItem>
                      <SelectItem value="bagagem_mercadoria">Bagagem/Mercadoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_ocorrencia">Data da Ocorrência</Label>
                  <Input
                    id="data_ocorrencia"
                    type="datetime-local"
                    {...register('data_ocorrencia', { required: 'Campo obrigatório' })}
                  />
                  {errors.data_ocorrencia && (
                    <p className="text-sm text-red-500">{errors.data_ocorrencia.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
                  <Input
                    id="valor_estimado"
                    type="number"
                    step="0.01"
                    {...register('valor_estimado', { required: 'Campo obrigatório', valueAsNumber: true })}
                    placeholder="5000.00"
                  />
                  {errors.valor_estimado && (
                    <p className="text-sm text-red-500">{errors.valor_estimado.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contato_email">Email para Contato</Label>
                  <Input
                    id="contato_email"
                    type="email"
                    {...register('contato_email', { required: 'Campo obrigatório' })}
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contato_telefone">Telefone para Contato</Label>
                  <Input
                    id="contato_telefone"
                    {...register('contato_telefone', { required: 'Campo obrigatório' })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao_ocorrencia">Descrição da Ocorrência</Label>
                <Textarea
                  id="descricao_ocorrencia"
                  {...register('descricao_ocorrencia', { required: 'Campo obrigatório' })}
                  placeholder="Descreva detalhadamente o que aconteceu..."
                  rows={4}
                />
                {errors.descricao_ocorrencia && (
                  <p className="text-sm text-red-500">{errors.descricao_ocorrencia.message}</p>
                )}
              </div>

              <Button 
                type="button" 
                onClick={() => setStep(2)}
                className="w-full"
                disabled={!tipoSinistro}
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Específicas e Documentos</h3>
              
              {tipoSinistro === 'acidentes_pessoais' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gravidade_lesao">Gravidade da Lesão</Label>
                    <Select onValueChange={(value) => setValue('gravidade_lesao', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a gravidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderada">Moderada</SelectItem>
                        <SelectItem value="grave">Grave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="documentos">Documentos Médicos</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <FileText className="mx-auto h-8 w-8 text-gray-400" />
                        <Input
                          id="documentos"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          {...register('documentos')}
                          className="mt-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Laudos médicos, atestados, receitas (PDF, JPG, PNG)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fotos">Fotos das Lesões</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Camera className="mx-auto h-8 w-8 text-gray-400" />
                        <Input
                          id="fotos"
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png"
                          {...register('fotos')}
                          className="mt-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Fotos das lesões (JPG, PNG)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tipoSinistro === 'bagagem_mercadoria' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo_transporte">Tipo de Transporte</Label>
                      <Select onValueChange={(value) => setValue('tipo_transporte', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aereo">Aéreo</SelectItem>
                          <SelectItem value="terrestre">Terrestre</SelectItem>
                          <SelectItem value="maritimo">Marítimo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="transportadora">Transportadora</Label>
                      <Input
                        id="transportadora"
                        {...register('transportadora')}
                        placeholder="Nome da transportadora"
                      />
                    </div>

                    <div>
                      <Label htmlFor="origem">Origem</Label>
                      <Input
                        id="origem"
                        {...register('origem')}
                        placeholder="Cidade de origem"
                      />
                    </div>

                    <div>
                      <Label htmlFor="destino">Destino</Label>
                      <Input
                        id="destino"
                        {...register('destino')}
                        placeholder="Cidade de destino"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="documentos">Documentos de Carga</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <FileText className="mx-auto h-8 w-8 text-gray-400" />
                        <Input
                          id="documentos"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          {...register('documentos')}
                          className="mt-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Notas fiscais, conhecimentos de transporte (PDF, JPG, PNG)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fotos">Fotos dos Danos</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Camera className="mx-auto h-8 w-8 text-gray-400" />
                        <Input
                          id="fotos"
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png"
                          {...register('fotos')}
                          className="mt-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Fotos dos danos à bagagem/mercadoria (JPG, PNG)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Enviar Sinistro'
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};