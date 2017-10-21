package org.streampipes.manager.setup;

import org.eclipse.rdf4j.repository.RepositoryException;
import org.eclipse.rdf4j.repository.config.RepositoryConfig;
import org.eclipse.rdf4j.repository.config.RepositoryConfigException;
import org.eclipse.rdf4j.repository.manager.RemoteRepositoryManager;
import org.eclipse.rdf4j.repository.sail.config.SailRepositoryConfig;
import org.eclipse.rdf4j.sail.config.SailImplConfig;
import org.eclipse.rdf4j.sail.inferencer.fc.config.ForwardChainingRDFSInferencerConfig;
import org.eclipse.rdf4j.sail.memory.config.MemoryStoreConfig;
import org.streampipes.model.client.messages.Message;
import org.streampipes.model.client.messages.Notifications;
import org.streampipes.storage.controller.StorageManager;
import org.streampipes.storage.util.SesameConfig;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SesameDbInstallationStep implements InstallationStep {

	private String sesameUrl;
	private String sesameDbName;
	
	public SesameDbInstallationStep() {
		this.sesameUrl = SesameConfig.INSTANCE.getUri();
		this.sesameDbName = SesameConfig.INSTANCE.getRepositoryId();
	}

	@Override
	public List<Message> install() {
		List<Message> msgs = new ArrayList<Message>();
		RemoteRepositoryManager manager = new RemoteRepositoryManager(sesameUrl);
		try {
			manager.initialize();
			msgs.add(Notifications.success("Connecting to Sesame Server..."));
			if (!manager.hasRepositoryConfig(sesameDbName))
			{
				msgs.add(Notifications.success("Retrieving Sesame databases..."));
				RepositoryConfig config = new RepositoryConfig(sesameDbName, "StreamPipes DB");
				SailImplConfig backendConfig = new MemoryStoreConfig(true, 10000);
				backendConfig = new ForwardChainingRDFSInferencerConfig(backendConfig);
				config.setRepositoryImplConfig(new SailRepositoryConfig(backendConfig));
				manager.addRepositoryConfig(config);
				msgs.add(Notifications.success("Creating Sesame database..."));
				boolean success = StorageManager.INSTANCE.getBackgroundKnowledgeStorage().initialize();
				if (success) msgs.add(Notifications.success("Adding schema..."));
				else msgs.add(Notifications.error("Adding schema..."));
			}
		} catch (RepositoryException e) {
			e.printStackTrace();
			return Arrays.asList(Notifications.error("Connecting to Sesame Server..."));
		} catch (RepositoryConfigException e) {
			return Arrays.asList(Notifications.error("Retrieving Sesame databases..."));
		} 
		return msgs;
	}
}
