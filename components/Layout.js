import Header from './Header';
import Normalize from '../styles/Normalize';

const Layout = props => (
  <React.Fragment>
    <Normalize />
    <Header />
    <div>{props.children}</div>
    <style jsx>{`
      div {
        margin: 0 auto;
        width: 980px;
      }
    `}</style>
  </React.Fragment>
);

export default Layout;
