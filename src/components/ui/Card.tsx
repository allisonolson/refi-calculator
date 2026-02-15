import type { ReactNode } from 'react';
import { Box, Heading } from '@chakra-ui/react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children }: CardProps) {
  return (
    <Box bg="bg.panel" rounded="lg" shadow="md" p={6}>
      {title && (
        <Heading size="lg" mb={4}>{title}</Heading>
      )}
      {children}
    </Box>
  );
}
