import { Box, Flex } from '@chakra-ui/react';
import { useCalculator } from './hooks/useCalculator';
import { InputPanel } from './components/InputPanel';
import { ResultsPanel } from './components/results/ResultsPanel';
import { ColorModeButton } from './components/ui/ColorModeButton';

function App() {
  const { inputs, setInputs, scenarios } = useCalculator();

  return (
    <Box minH="100vh" bg="bg">
      <Flex direction={{ base: 'column', lg: 'row' }}>
        {/* Input Panel - Sticky on Desktop */}
        <Box
          w={{ base: 'full', lg: '400px' }}
          h={{ base: 'auto', lg: '100vh' }}
          position={{ base: 'relative', lg: 'sticky' }}
          top={0}
          overflowY={{ base: 'visible', lg: 'auto' }}
          bg="bg.muted"
          p={6}
          borderRightWidth={{ base: 0, lg: 1 }}
          borderColor="border"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Box />
            <ColorModeButton />
          </Flex>
          <InputPanel inputs={inputs} onChange={setInputs} />
        </Box>

        {/* Results Panel - Scrollable */}
        <Box flex={1} p={6} overflowY={{ base: 'visible', lg: 'auto' }}>
          <ResultsPanel scenarios={scenarios} />
        </Box>
      </Flex>
    </Box>
  );
}

export default App;
