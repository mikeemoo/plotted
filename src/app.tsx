import React from 'react';
import Container from 'rsuite/Container';
import Sidebar from 'rsuite/Sidebar';
import Content from 'rsuite/Content';
import Form from 'rsuite/Form';
import InputPicker from 'rsuite/InputPicker';
import Input from 'rsuite/Input';
import Loader from 'rsuite/Loader';
import InputNumber from 'rsuite/InputNumber';
import { Config, DrawingPass, Generator } from './types';
import generators from './generators';
import Preview from './preview';
import HPGL from './hpgl';

let timeout: NodeJS.Timeout | null = null;

const defaultValues: Config = {
  pageWidth: 300,
  pageHeight: 400,
  pageColor: 'white',
  unitsPerMM: 40
};

let currentGeneratorProcess : AsyncGenerator<any> | null = null;

export default () => {

  let params = window.location.hash ?
    {
      ...defaultValues,
      ...JSON.parse(decodeURIComponent(window.location.hash.substring(1)))
    } : defaultValues;


  if (!params.generator) {
    const firstGenerator = Object.keys(generators)[0];
    params = {
      ...params,
      generator: firstGenerator
    };
  }

  params = {
    ...generators[params.generator].defaultValues,
    ...params
  }

  const [ parameters, setParameters ] = React.useState<Config>(params);
  const [ loading, setLoading ] = React.useState<boolean>(false);
  const [ loadingMessage, setLoadingMessage ] = React.useState<string>('Generating...');
  const [ parametersGeneratedWith, setParametersGeneratedWith ] = React.useState<Config>(params);
  const [ drawingPasses, setDrawingPasses ] = React.useState<DrawingPass[]>();

  const generator: Generator = generators[parameters.generator!];

  React.useEffect(() => {
    
    if (currentGeneratorProcess) {
      try {
        currentGeneratorProcess.throw(new Error('Cancelled'));
      } catch(e) {

      }
    }

    setLoading(true);


    (async () => {
      await new Promise((res) => setTimeout(res, 0));
      currentGeneratorProcess = generators[parameters.generator!].generate(params);
      const results: DrawingPass[] = await (async (gen) => {
        for await (const msg of gen) {
          if (gen !== currentGeneratorProcess) {
            return null;
          }
          if (typeof msg === 'string') {
            setLoadingMessage(msg);
          } else {
            return msg;
          }
        }
      })(currentGeneratorProcess)

      if (results) {
        currentGeneratorProcess = null;
        setLoading(false);
        setParametersGeneratedWith(params);
        setDrawingPasses(results || []);
      }
    })();
  }, [parameters])

  return (
    
    <Container>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20, paddingBottom: 20, backgroundColor: loading ? 'transparent' : 'white', minHeight: '100vh'}}>
      
        {loading ? <Loader center size="lg" content={loadingMessage} /> : <Preview parameters={parametersGeneratedWith} passes={drawingPasses || []} />}
        
      </Content>
      <Sidebar style={{paddingLeft: 10}}>
        <Form
          formDefaultValue={parameters}
          onChange={(data) => {
            
            if (timeout) {
              clearTimeout(timeout);
            }
            
            timeout = setTimeout(() => {

              const nextGenerator = data.generator;
              let paramsToSet = nextGenerator == parameters.generator ? {
                ...generators[nextGenerator].defaultValues,
                ...data
               } : {
                ...Object.keys(defaultValues).reduce((acc, key) => {
                  acc[key] = data[key] || defaultValues[key];
                  return acc
                }, {} as Config),
                ...generators[nextGenerator].defaultValues,
                generator: nextGenerator
              };
              
              setParameters(paramsToSet);
              location.href = `#${encodeURIComponent(JSON.stringify(paramsToSet))}`;
              
            }, 500);
          }}
          style={{marginTop: 10}}
        >
          <Form.Group controlId="dimensions">
            <Form.ControlLabel>Paper dimensions:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="pageWidth"
              step={10}
              style={{width: 75}}
            />
            &nbsp;x&nbsp; 
            <Form.Control
              accepter={InputNumber}
              name="pageHeight"
              step={10}
              style={{width: 75}}
            />
          </Form.Group>
          <Form.Group controlId="pageColor">
            <Form.ControlLabel>Page color:</Form.ControlLabel>
            <Form.Control
              accepter={Input}
              name="pageColor"
              style={{width: 120}}
            />
          </Form.Group>
          <Form.Group controlId="unitsPerMM">
            <Form.ControlLabel>Units per MM:</Form.ControlLabel>
            <Form.Control
              accepter={InputNumber}
              name="unitsPerMM"
              style={{width: 120}}
            />
          </Form.Group>
          <Form.Group controlId="generator">
            <Form.ControlLabel>Generator:</Form.ControlLabel>
            <Form.Control
              accepter={InputPicker}
              name="generator"
              cleanable={false}
              data={
                Object.keys(generators).map((value) => ({ value, label: value }))
              }
            />
          </Form.Group>
          <generator.controls params={parameters} />
        </Form>
        {!loading && <HPGL passes={drawingPasses || []} unitsPerMM={parameters.unitsPerMM as number} /> }
      </Sidebar>
    </Container>
  );
};