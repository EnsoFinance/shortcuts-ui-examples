import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { TokenData } from "@ensofinance/sdk";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Position } from "@/types";

const ConfirmDialog = ({
  open,
  onOpenChange,
  position,
  targetToken,
}: {
  targetToken?: TokenData;
  position?: Position;
  open: boolean;
  onOpenChange: (open: any) => void;
}) => {
  const sourceApy = position?.token?.apy;
  const apyDifference = (targetToken?.apy - sourceApy).toFixed(1);
  const apyPercentageGain = (
    ((targetToken?.apy - sourceApy) / sourceApy) *
    100
  ).toFixed(1);

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preview Migration</DialogTitle>
          <DialogDescription>
            Review your position migration details
          </DialogDescription>
        </DialogHeader>

        <VStack gap={4}>
          <Box>
            <Heading size="sm">Source Position</Heading>
            <HStack justify="space-between" mt={1}>
              <Text>{position?.token?.name}</Text>
              <Text>{position?.token?.apy}% APY</Text>
            </HStack>
          </Box>

          <Box>
            <Heading size="sm">Target Position</Heading>
            <HStack justify="space-between" mt={1}>
              <Text>{targetToken?.name}</Text>
              <Text>{targetToken?.apy}% APY</Text>
            </HStack>
          </Box>

          <Box>
            <Heading size="sm">Expected Improvement</Heading>
            <HStack mt={2} align="center" gap={2}>
              <Text fontSize="2xl" fontWeight="semibold">
                {apyDifference}%
              </Text>
              <Text color={+apyDifference > 0 ? "green.600" : "red.600"}>
                {+apyDifference > 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {apyPercentageGain}% improvement in APY
            </Text>
          </Box>

          <Text fontSize="sm" color="gray.600">
            Estimated gas cost: ~$20-30
          </Text>
        </VStack>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Confirm Migration</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default ConfirmDialog;
