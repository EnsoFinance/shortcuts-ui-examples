import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Box,
  Heading,
  Text,
  HStack,
  useDisclosure,
  Card,
  Center,
  Skeleton,
} from "@chakra-ui/react";
import { isAddress } from "viem";
import { useAccount, useChainId } from "wagmi";
import { TokenData } from "@ensofinance/sdk";
import { useEnsoBalances, useEnsoTokenDetails } from "@/service/enso";
import { formatNumber, formatUSD, normalizeValue } from "@/service";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Position } from "@/types";

const SourcePoolItem = ({
  position,
  isSelected,
  onClick,
}: {
  position: Position;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const normalizedBalance = normalizeValue(
    position.balance.amount,
    position.token.decimals,
  );

  return (
    <Box
      p={4}
      shadow="sm"
      rounded="xl"
      cursor="pointer"
      transition="all"
      _hover={{ shadow: "md" }}
      border={"2px solid"}
      borderColor={isSelected ? "blue.500" : "transparent"}
      onClick={onClick}
    >
      <HStack justify="space-between" align="start">
        <Box>
          <Text fontSize="md">{position.token.name}</Text>
          <Text fontSize="xs" color={"gray.600"}>
            {position.token.protocolSlug}
          </Text>

          <Text color="gray.600">
            {position.token.underlyingTokens
              .map(({ symbol }) => symbol)
              .join("/")}
          </Text>

          {/*<Text mt={1} fontSize="sm" color="gray.600">*/}
          {/*  TVL: ${(1.1).toFixed(1)}M*/}
          {/*</Text>*/}
        </Box>
        <Box textAlign="right">
          <Text fontWeight="medium">
            {formatUSD(+normalizedBalance * +position.balance.price)}
          </Text>
          <Text>
            {formatNumber(normalizedBalance)} {position.token.symbol}
          </Text>

          {position.token.apy > 0 && (
            <Text fontSize="sm" color="gray.600">
              {position.token.apy.toFixed(2)}% APY
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

const TargetPoolItem = ({
  token,
  sourceApy,
  onSelect,
}: {
  token: TokenData;
  sourceApy: number;
  onSelect: () => void;
}) => {
  const apyDiff = token.apy - sourceApy;
  const isPositive = apyDiff > 0;

  return (
    <Box
      p={4}
      shadow="sm"
      rounded="xl"
      cursor="pointer"
      _hover={{ shadow: "md" }}
      onClick={onSelect}
    >
      <HStack justify="space-between" align="start">
        <Box>
          <Text fontSize="md">{token.name}</Text>
          <Text fontSize="xs" color={"gray.600"}>
            {token.protocolSlug}
          </Text>{" "}
          {/*<Text mt={1} fontSize="sm" color="gray.600">*/}
          {/*  TVL: ${(1.1).toFixed(1)}M*/}
          {/*</Text>*/}
        </Box>

        {token.apy > 0 && (
          <Box textAlign="right">
            <Text fontSize="lg" fontWeight="medium">
              {token.apy.toFixed(2)}% APY
            </Text>
            <HStack
              justify="end"
              gap={1}
              fontSize="sm"
              color={isPositive ? "green.500" : "red.500"}
            >
              {isPositive ? <TrendingUp /> : <TrendingDown />}
              {sourceApy > 0 && token.apy > 0 && (
                <Text color={isPositive ? "green.600" : "red.600"}>
                  {isPositive ? "+" : ""}
                  {apyDiff.toFixed(2)}% vs source
                </Text>
              )}
            </HStack>
          </Box>
        )}
      </HStack>
    </Box>
  );
};

const RenderSkeletons = () =>
  [1, 2, 3].map((_, i) => (
    <Skeleton rounded="xl" key={i} h={"110px"} w={"340px"} />
  ));

const usePositions = () => {
  const { data: balances, isLoading: balancesLoading } = useEnsoBalances();
  const notEmptyBalanceAddresses = balances
    ?.filter(({ price, token }) => +price > 0 && isAddress(token))
    .map((position) => position.token);
  const { data: positionsTokens, isLoading: tokenLoading } =
    useEnsoTokenDetails({
      address: notEmptyBalanceAddresses,
    });

  const positions = balances
    ?.map((balance) => {
      const token = positionsTokens?.find(
        (token) => token.address === balance.token,
      );

      return { balance, token };
    })
    .filter(({ token }) => token?.type === "defi");

  return {
    positions,
    isLoading: balancesLoading || tokenLoading,
  };
};

const Home = () => {
  const [selectedSource, setSelectedSource] = useState<Position>();
  const [selectedTarget, setSelectedTarget] = useState<TokenData>();
  const { open, onOpen, onClose } = useDisclosure();

  const { address } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    setSelectedSource(undefined);
  }, [chainId, address]);

  const { positions, isLoading: positionLoading } = usePositions();
  const underlyingTokens = selectedSource?.token.underlyingTokens.map(
    ({ address }) => address,
  );
  const { data: underlyingTokensData, isLoading: targetLoading } =
    useEnsoTokenDetails({
      underlyingTokens,
    });

  const filteredUnderlyingTokens = underlyingTokensData?.filter(
    (token) =>
      token.underlyingTokens?.length === underlyingTokens?.length &&
      token.underlyingTokens?.every((underlyingToken) =>
        underlyingTokens.includes(underlyingToken.address),
      ) &&
      token.name !== selectedSource?.token.name &&
      token.apy > 0,
  );

  console.log(filteredUnderlyingTokens);

  const handleTargetSelect = (target) => {
    setSelectedTarget(target);
    onOpen();
  };

  return (
    <Box minH="100vh">
      <Center>
        <Box mx="auto" maxW="7xl" px={4} py={8}>
          <Heading
            mb={8}
            display="flex"
            alignItems="center"
            gap={2}
            fontSize="2xl"
            fontWeight="bold"
          >
            <ArrowRightLeft className="h-6 w-6" />
            Yield Migrator
          </Heading>

          <HStack gap={6} w={"full"} align="start">
            {/* Source Pool Column */}
            <Box w={390}>
              <Card.Root>
                <Card.Header>
                  <Heading size="md">Your positions</Heading>
                </Card.Header>
                <Card.Body gap={4}>
                  {positionLoading ? (
                    <RenderSkeletons />
                  ) : positions?.length === 0 ? (
                    <Box
                      display="flex"
                      h="40"
                      alignItems="center"
                      justifyContent="center"
                      color="gray.500"
                    >
                      <Text>No positions found</Text>
                    </Box>
                  ) : (
                    positions?.map((position) => (
                      <SourcePoolItem
                        key={position.token.address}
                        position={position}
                        isSelected={
                          selectedSource?.token.address ===
                          position.token.address
                        }
                        onClick={() => setSelectedSource(position)}
                      />
                    ))
                  )}
                </Card.Body>
              </Card.Root>
            </Box>

            {/* Target Pool Column */}
            <Box w={390}>
              <Card.Root>
                <Card.Header>
                  <Heading size="md">Target Pool</Heading>
                </Card.Header>
                <Card.Body gap={4}>
                  {selectedSource ? (
                    targetLoading ? (
                      <RenderSkeletons />
                    ) : (
                      filteredUnderlyingTokens?.map((target) => (
                        <TargetPoolItem
                          key={target.address}
                          token={target}
                          sourceApy={selectedSource?.token.apy}
                          onSelect={() => handleTargetSelect(target)}
                        />
                      ))
                    )
                  ) : (
                    <Box
                      display="flex"
                      h="40"
                      alignItems="center"
                      justifyContent="center"
                      color="gray.500"
                    >
                      <HStack alignItems="center" gap={2}>
                        <Text>Select a source pool</Text>
                        <ArrowRight className="h-4 w-4" />
                      </HStack>
                    </Box>
                  )}
                </Card.Body>
              </Card.Root>
            </Box>
          </HStack>
        </Box>
      </Center>
      <ConfirmDialog
        open={open}
        onOpenChange={onClose}
        position={selectedSource}
        targetToken={selectedTarget}
      />
    </Box>
  );
};

export default Home;
