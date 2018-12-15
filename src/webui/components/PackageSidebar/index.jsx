import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import LastSync from './modules/LastSync';
import Maintainers from './modules/Maintainers';
import Dependencies from './modules/Dependencies';
import PeerDependencies from './modules/PeerDependencies';
import Infos from './modules/Infos';

import {
  formatLicense,
  formatRepository,
  getLastUpdatedPackageTime,
  getRecentReleases,
} from '../../utils/package';
import API from '../../utils/api';

export default class PackageSidebar extends React.Component {
  state = {};

  static propTypes = {
    packageName: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.loadPackageData = this.loadPackageData.bind(this);
  }

  async componentDidMount() {
    await this.loadPackageData(this.props.packageName);
  }

  async loadPackageData(packageName) {
    let packageMeta;

    try {
      packageMeta = await API.request(`sidebar/${packageName}`, 'GET');
    } catch (err) {
      this.setState({
        failed: true,
      });
    }

    this.setState({
      packageMeta,
    });
  }

  render() {
    let {packageMeta} = this.state;

    if (packageMeta) {
      const {time, _uplinks} = packageMeta;

      // Infos component
      const license = formatLicense(get(packageMeta, 'latest.license', null));
      const repository = formatRepository(
        get(packageMeta, 'latest.repository', null)
      );
      const homepage = get(packageMeta, 'latest.homepage', null);

      // Lastsync component
      const recentReleases = getRecentReleases(time);
      const lastUpdated = getLastUpdatedPackageTime(_uplinks);

      // Dependencies component
      const dependencies = get(packageMeta, 'latest.dependencies', {});
      const peerDependencies = get(packageMeta, 'latest.peerDependencies', {});

      // Maintainers component
      return (
        <aside className="sidebar-info">
          {time && (
            <LastSync
              lastUpdated={lastUpdated}
              recentReleases={recentReleases}
            />
          )}
          <Infos
            homepage={homepage}
            license={license}
            repository={repository}
          />
          {/* TODO: Refacor later, when we decide to show only maintainers/authors */}
          <Maintainers packageMeta={packageMeta} />
          <Dependencies dependencies={dependencies} />
          <PeerDependencies dependencies={peerDependencies} />
          {/* Package management module? Help us implement it! */}
        </aside>
      );
    }
    return (
      <aside className="sidebar-loading">Loading package information...</aside>
    );
  }
}
