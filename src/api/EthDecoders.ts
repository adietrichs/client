import { CheckedTypeUtils } from '../utils/CheckedTypeUtils';
import {
  RawArrivalData,
  RawArtifactWithMetadata,
  RawPlanetData,
  RawPlanetExtendedInfo,
  RawUpgrade,
  RawUpgradesInfo,
  UpgradesInfo,
} from '../_types/darkforest/api/ContractsAPITypes';
import {
  QueuedArrival,
  VoyageId,
  Artifact,
  PlanetLevel,
  Biome,
  ArtifactType,
  Planet,
  SpaceType,
  Upgrade,
} from '../_types/global/GlobalTypes';
import { contractPrecision } from './ContractsAPI';

/**
 * Responsible for deserializing objects received from the blockchain.
 */
export class EthDecoders {
  public static rawArrivalToObject(rawArrival: RawArrivalData): QueuedArrival {
    const rawId = rawArrival[0];
    const rawPlayer = rawArrival[1];
    const rawFromPlanet = rawArrival[2];
    const rawToPlanet = rawArrival[3];
    const rawPopArriving = rawArrival[4];
    const rawSilverMoved = rawArrival[5];
    const rawDepartureTime = rawArrival[6];
    const rawArrivalTime = rawArrival[7];

    const arrival: QueuedArrival = {
      eventId: rawId.toString() as VoyageId,
      player: CheckedTypeUtils.address(rawPlayer),
      fromPlanet: CheckedTypeUtils.locationIdFromDecStr(
        rawFromPlanet.toString()
      ),
      toPlanet: CheckedTypeUtils.locationIdFromDecStr(rawToPlanet.toString()),
      energyArriving: rawPopArriving.toNumber() / contractPrecision,
      silverMoved: rawSilverMoved.toNumber() / contractPrecision,
      departureTime: rawDepartureTime.toNumber(),
      arrivalTime: rawArrivalTime.toNumber(),
    };

    return arrival;
  }

  public static rawArtifactWithMetadataToArtifact(
    rawArtifactWithMetadata: RawArtifactWithMetadata
  ): Artifact {
    const rawArtifact = rawArtifactWithMetadata[0];
    const rawUpgrade = rawArtifactWithMetadata[1];
    const rawOwner = rawArtifactWithMetadata[2];
    const rawLocationId = rawArtifactWithMetadata[3];
    const planetLevel = rawArtifact[2].toNumber() as PlanetLevel;
    const planetBiome = rawArtifact[3] as Biome;
    const artifactType = rawArtifact[6] as ArtifactType;
    const ret: Artifact = {
      id: CheckedTypeUtils.artifactIdFromEthersBN(rawArtifact[0]),
      planetDiscoveredOn: CheckedTypeUtils.locationIdFromDecStr(
        rawArtifact[1].toString()
      ),
      planetLevel,
      planetBiome,
      mintedAtTimestamp: rawArtifact[4].toNumber(),
      discoverer: CheckedTypeUtils.address(rawArtifact[5]),
      currentOwner: CheckedTypeUtils.address(rawOwner),
      artifactType,
      upgrade: EthDecoders.rawUpgradeToUpgrade(rawUpgrade),
    };
    if (!rawLocationId.eq(0)) {
      ret.onPlanetId = CheckedTypeUtils.locationIdFromEthersBN(rawLocationId);
    }
    return ret;
  }

  public static rawPlanetToObject(
    rawLocationId: string,
    rawPlanet: RawPlanetData,
    rawPlanetExtendedInfo: RawPlanetExtendedInfo
  ): Planet {
    const rawOwner = rawPlanet[0];
    const rawRange = rawPlanet[1];
    const rawSpeed = rawPlanet[2];
    const rawDefense = rawPlanet[3];
    const rawPopulation = rawPlanet[4];
    const rawPopulationCap = rawPlanet[5];
    const rawPopulationGrowth = rawPlanet[6];
    const rawPlanetResource = rawPlanet[7];
    const rawSilverCap = rawPlanet[8];
    const rawSilverGrowth = rawPlanet[9];
    const rawSilver = rawPlanet[10];
    const rawPlanetLevel = rawPlanet[11];

    const rawLastUpdated = rawPlanetExtendedInfo[2];
    const rawPerlin = rawPlanetExtendedInfo[3];
    const rawSpaceType = rawPlanetExtendedInfo[4] as SpaceType;
    const rawUpgradeState = [
      rawPlanetExtendedInfo[5],
      rawPlanetExtendedInfo[6],
      rawPlanetExtendedInfo[7],
    ];
    const rawHatLevel = rawPlanetExtendedInfo[8];

    const planet: Planet = {
      locationId: CheckedTypeUtils.locationIdFromDecStr(
        rawLocationId.toString()
      ),
      perlin: rawPerlin.toNumber(),
      spaceType: rawSpaceType,
      owner: CheckedTypeUtils.address(rawOwner),
      hatLevel: rawHatLevel.toNumber(),

      planetLevel: rawPlanetLevel.toNumber(),
      planetResource: rawPlanetResource,

      energyCap: rawPopulationCap.toNumber() / contractPrecision,
      energyGrowth: rawPopulationGrowth.toNumber() / contractPrecision,

      silverCap: rawSilverCap.toNumber() / contractPrecision,
      silverGrowth: rawSilverGrowth.toNumber() / contractPrecision,

      energy: rawPopulation.toNumber() / contractPrecision,
      silver: rawSilver.toNumber() / contractPrecision,

      range: rawRange.toNumber(),
      speed: rawSpeed.toNumber(),
      defense: rawDefense.toNumber(),

      // metadata
      lastUpdated: rawLastUpdated.toNumber(),
      upgradeState: [
        rawUpgradeState[0].toNumber(),
        rawUpgradeState[1].toNumber(),
        rawUpgradeState[2].toNumber(),
      ],

      unconfirmedDepartures: [],
      unconfirmedUpgrades: [],
      unconfirmedBuyHats: [],
      unconfirmedPlanetTransfers: [],
      unconfirmedFindArtifact: undefined,
      silverSpent: 0, // this is stale and will be updated in entitystore

      isInContract: true,
      syncedWithContract: true,
      hasTriedFindingArtifact: rawPlanetExtendedInfo[9],
    };

    if (!rawPlanetExtendedInfo[10].eq(0)) {
      planet.heldArtifactId = CheckedTypeUtils.artifactIdFromEthersBN(
        rawPlanetExtendedInfo[10]
      );
      planet.artifactLockedTimestamp = rawPlanetExtendedInfo[11].toNumber();
    }
    return planet;
  }

  public static rawUpgradeToUpgrade(rawUpgrade: RawUpgrade): Upgrade {
    return {
      energyCapMultiplier: rawUpgrade[0].toNumber(),
      energyGroMultiplier: rawUpgrade[1].toNumber(),
      rangeMultiplier: rawUpgrade[2].toNumber(),
      speedMultiplier: rawUpgrade[3].toNumber(),
      defMultiplier: rawUpgrade[4].toNumber(),
    };
  }

  public static rawUpgradesInfoToUpgradesInfo(
    rawUpgradesInfo: RawUpgradesInfo
  ): UpgradesInfo {
    return rawUpgradesInfo.map((a) =>
      a.map((b) => EthDecoders.rawUpgradeToUpgrade(b))
    ) as UpgradesInfo;
  }
}
