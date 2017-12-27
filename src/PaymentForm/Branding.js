const Branding = ({className, white}) => (
  <div className={className}>
    <span>Powered by</span>{' '}
    <a href="https://monei.net/" target="_blank" className="brand">
      <img
        src={`https://static.monei.net/monei-logo${white ? '-white' : ''}.svg`}
        alt="MONEI"
        title="Best payment gateway rates. The perfect solution to manage your digital payments. Get in now!"
      />
    </a>
  </div>
);

export default Branding;
